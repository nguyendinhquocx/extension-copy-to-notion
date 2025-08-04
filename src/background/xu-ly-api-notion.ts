/**
 * Notion API Integration Service
 * Xử lý tất cả interactions với Notion API
 */

import { QuanLyStorage } from './quan-ly-storage';

/**
 * Service xử lý Notion API operations
 */
export class XuLyAPINotion {
  private storage: QuanLyStorage;

  constructor() {
    this.storage = new QuanLyStorage();
  }

  /**
   * Check Notion connection
   */
  async kiemTraKetNoi(): Promise<boolean> {
    try {
      console.log('🔄 Checking Notion connection...');
      
      const apiKey = await this.storage.lay_notion_api_key();
      console.log('🔑 API key status:', apiKey ? 'Found' : 'Not found');
      
      if (!apiKey) {
        return false;
      }

      // Simple API test - get user info
      const response = await fetch('https://api.notion.com/v1/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Notion API response status:', response.status);
      return response.ok;
    } catch (error) {
      console.error('❌ Notion connection check failed:', error);
      return false;
    }
  }

  /**
   * Get available databases
   */
  async layDatabases() {
    try {
      console.log('🔄 Getting available databases...');
      
      const apiKey = await this.storage.lay_notion_api_key();
      console.log('🔑 API key for databases:', apiKey ? 'Found' : 'Not found');
      
      if (!apiKey) {
        throw new Error('No API key configured');
      }

      console.log('📡 Making search request to Notion API...');
      
      const response = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filter: {
            value: 'database',
            property: 'object'
          },
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time'
          }
        })
      });

      console.log('📊 Search API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📋 Raw database results:', data);
      
      const databases = data.results.map((db: any) => ({
        id: db.id,
        title: db.title?.[0]?.plain_text || 'Untitled Database',
        url: db.url,
        lastEdited: db.last_edited_time
      }));
      
      console.log('✅ Processed databases:', databases);
      return databases;
    } catch (error) {
      console.error('❌ Failed to get databases:', error);
      throw error;
    }
  }

  /**
   * Split content into chunks of max 2000 characters
   */
  private chiaContentThanhChunks(content: string, maxLength: number = 2000): string[] {
    if (!content || content.length <= maxLength) {
      return [content || 'No content extracted'];
    }

    const chunks: string[] = [];
    let currentIndex = 0;

    while (currentIndex < content.length) {
      let endIndex = currentIndex + maxLength;
      
      // If not at the end, try to break at word boundary
      if (endIndex < content.length) {
        const lastSpaceIndex = content.lastIndexOf(' ', endIndex);
        const lastNewlineIndex = content.lastIndexOf('\n', endIndex);
        const lastBreakIndex = Math.max(lastSpaceIndex, lastNewlineIndex);
        
        if (lastBreakIndex > currentIndex) {
          endIndex = lastBreakIndex;
        }
      }
      
      chunks.push(content.slice(currentIndex, endIndex).trim());
      currentIndex = endIndex;
    }

    return chunks;
  }

  /**
   * Save page to Notion
   */
  async luuTrangWeb(contentData: any) {
    try {
      console.log('🔄 Starting to save to Notion...');
      
      const apiKey = await this.storage.lay_notion_api_key();
      const databaseId = await this.storage.lay_database_id_mac_dinh();
      
      console.log('🔑 API Key:', apiKey ? 'Found' : 'Missing');
      console.log('🗄️ Database ID:', databaseId ? `Found: ${databaseId}` : 'Missing');
      console.log('🗄️ Raw Database ID type:', typeof databaseId);
      console.log('🗄️ Raw Database ID value:', JSON.stringify(databaseId));
      
      if (!apiKey || !databaseId) {
        console.error('❌ Missing credentials - API Key:', !!apiKey, 'Database ID:', !!databaseId);
        throw new Error('Missing API key or database ID');
      }

      // Clean database ID - remove dashes and ensure proper format
      // Format database ID correctly - Notion expects dashes to be included
      // Example valid format: 2414e83d-df78-80d9-ad00-db7ef1e0df09
      let formattedDatabaseId = databaseId;
      
      // If database ID is raw (no dashes), add them in the correct positions
      if (!databaseId.includes('-') && databaseId.length >= 32) {
        formattedDatabaseId = [
          databaseId.slice(0, 8),
          databaseId.slice(8, 12),
          databaseId.slice(12, 16),
          databaseId.slice(16, 20),
          databaseId.slice(20)
        ].join('-');
        console.log('🧹 Added dashes to Database ID:', formattedDatabaseId);
      }
      
      console.log('🗄️ Final Database ID format:', formattedDatabaseId);

      // Split content into manageable chunks
      const contentChunks = this.chiaContentThanhChunks(contentData.content);
      console.log(`📝 Content split into ${contentChunks.length} chunks`);

      // Create children blocks for each content chunk
      const children = contentChunks.map(chunk => ({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: chunk
              }
            }
          ]
        }
      }));

      const requestBody = {
        parent: {
          database_id: formattedDatabaseId
        },
        properties: {
          'Name': {
            title: [
              {
                text: {
                  content: contentData.title || 'Untitled Page'
                }
              }
            ]
          },
          'URL': {
            url: contentData.url || ''
          }
        },
        children: children
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

      // Create page in Notion database
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to save to Notion: ${errorData.message || response.status}`);
      }

      const result = await response.json();
      return {
        pageId: result.id,
        url: result.url,
        title: contentData.title
      };
    } catch (error) {
      console.error('❌ Failed to save to Notion:', error);
      throw error;
    }
  }
}
