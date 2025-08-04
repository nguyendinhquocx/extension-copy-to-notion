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
   * Save page to Notion
   */
  async luuTrangWeb(contentData: any) {
    try {
      const apiKey = await this.storage.lay_notion_api_key();
      const databaseId = await this.storage.lay_database_id_mac_dinh();
      
      if (!apiKey || !databaseId) {
        throw new Error('Missing API key or database ID');
      }

      // Create page in Notion database
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parent: {
            database_id: databaseId
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
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: {
                      content: contentData.content || 'No content extracted'
                    }
                  }
                ]
              }
            }
          ]
        })
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
