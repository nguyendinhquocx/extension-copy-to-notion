/**
 * Markdown Formatting Utilities
 * Tiện ích định dạng và chuyển đổi Markdown
 */

/**
 * Class xử lý chuyển đổi HTML sang Markdown
 */
export class DinhDangMarkdown {
  private readonly tag_map: Record<string, (el: HTMLElement, content: string) => string> = {
    h1: (_el, content) => `# ${content}\n\n`,
    h2: (_el, content) => `## ${content}\n\n`,
    h3: (_el, content) => `### ${content}\n\n`,
    h4: (_el, content) => `#### ${content}\n\n`,
    h5: (_el, content) => `##### ${content}\n\n`,
    h6: (_el, content) => `###### ${content}\n\n`,
    p: (_el, content) => `${content}\n\n`,
    br: () => '\n',
    strong: (_el, content) => `**${content}**`,
    b: (_el, content) => `**${content}**`,
    em: (_el, content) => `*${content}*`,
    i: (_el, content) => `*${content}*`,
    u: (_el, content) => `<u>${content}</u>`,
    s: (_el, content) => `~~${content}~~`,
    del: (_el, content) => `~~${content}~~`,
    code: (_el, content) => `\`${content}\``,
    pre: (_el, content) => `\n\`\`\`\n${content}\n\`\`\`\n\n`,
    blockquote: (_el, content) => content.split('\n').map(line => `> ${line}`).join('\n') + '\n\n',
    a: (el, content) => {
      const href = el.getAttribute('href') || '';
      const title = el.getAttribute('title');
      return title ? `[${content}](${href} "${title}")` : `[${content}](${href})`;
    },
    img: (el) => {
      const src = el.getAttribute('src') || '';
      const alt = el.getAttribute('alt') || '';
      const title = el.getAttribute('title');
      return title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`;
    },
    hr: () => '\n---\n\n',
    ul: (_el, content) => content + '\n',
    ol: (_el, content) => content + '\n',
    li: (el, content) => {
      const parent = el.parentElement;
      if (parent?.tagName.toLowerCase() === 'ol') {
        const index = Array.from(parent.children).indexOf(el) + 1;
        return `${index}. ${content}\n`;
      }
      return `- ${content}\n`;
    },
    table: (_el, content) => content + '\n',
    thead: (_el, content) => content,
    tbody: (_el, content) => content,
    tr: (_el, content) => `${content}\n`,
    th: (_el, content) => `| ${content} `,
    td: (_el, content) => `| ${content} `
  };

  /**
   * Chuyển đổi HTML sang Markdown
   */
  htmlSangMarkdown(html: string): string {
    // Tạo một DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    return this.xuLyElement(doc.body).trim();
  }

  /**
   * Chuyển đổi HTMLElement sang Markdown
   */
  elementSangMarkdown(element: HTMLElement): string {
    return this.xuLyElement(element).trim();
  }

  /**
   * Xử lý một element và chuyển thành Markdown
   */
  private xuLyElement(element: Element): string {
    let result = '';
    
    for (const node of Array.from(element.childNodes)) {
      if (node.nodeType === Node.TEXT_NODE) {
        result += this.xuLyTextNode(node as Text);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        result += this.xuLyHTMLElement(node as HTMLElement);
      }
    }
    
    return result;
  }

  /**
   * Xử lý text node
   */
  private xuLyTextNode(textNode: Text): string {
    const text = textNode.textContent || '';
    
    // Loại bỏ whitespace thừa nhưng giữ line breaks có ý nghĩa
    return text.replace(/\s+/g, ' ');
  }

  /**
   * Xử lý HTML element
   */
  private xuLyHTMLElement(element: HTMLElement): string {
    const tagName = element.tagName.toLowerCase();
    const content = this.xuLyElement(element);
    
    const handler = this.tag_map[tagName];
    if (handler) {
      return handler(element, content);
    }
    
    // Mặc định trả về nội dung bên trong
    return content;
  }

  /**
   * Làm sạch markdown và format lại
   */
  lamSachMarkdown(markdown: string): string {
    return markdown
      // Loại bỏ nhiều line breaks liên tiếp
      .replace(/\n{3,}/g, '\n\n')
      // Loại bỏ spaces thừa ở đầu/cuối dòng
      .replace(/[ \t]+$/gm, '')
      .replace(/^[ \t]+/gm, '')
      // Loại bỏ spaces thừa trong text
      .replace(/  +/g, ' ')
      .trim();
  }

  /**
   * Thêm metadata vào đầu markdown
   */
  themMetadata(markdown: string, metadata: MarkdownMetadata): string {
    const frontmatter = this.taoFrontmatter(metadata);
    return frontmatter + '\n\n' + markdown;
  }

  /**
   * Tạo frontmatter YAML
   */
  private taoFrontmatter(metadata: MarkdownMetadata): string {
    const lines = ['---'];
    
    if (metadata.title) {
      lines.push(`title: "${metadata.title}"`);
    }
    
    if (metadata.date) {
      lines.push(`date: ${metadata.date.toISOString()}`);
    }
    
    if (metadata.author) {
      lines.push(`author: "${metadata.author}"`);
    }
    
    if (metadata.source_url) {
      lines.push(`source: "${metadata.source_url}"`);
    }
    
    if (metadata.tags && metadata.tags.length > 0) {
      lines.push(`tags:`);
      metadata.tags.forEach(tag => {
        lines.push(`  - "${tag}"`);
      });
    }
    
    if (metadata.description) {
      lines.push(`description: "${metadata.description}"`);
    }
    
    lines.push('---');
    
    return lines.join('\n');
  }

  /**
   * Thêm table of contents
   */
  themMucLuc(markdown: string): string {
    const headings = this.timCacHeading(markdown);
    
    if (headings.length === 0) {
      return markdown;
    }
    
    const toc = this.taoTableOfContents(headings);
    
    // Chèn TOC sau frontmatter hoặc ở đầu
    const frontmatterMatch = markdown.match(/^---\n[\s\S]*?\n---\n/);
    
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[0];
      const content = markdown.substring(frontmatter.length);
      return frontmatter + '\n' + toc + '\n\n' + content;
    } else {
      return toc + '\n\n' + markdown;
    }
  }

  /**
   * Tìm các heading trong markdown
   */
  private timCacHeading(markdown: string): HeadingInfo[] {
    const headings: HeadingInfo[] = [];
    const lines = markdown.split('\n');
    
    lines.forEach((line, index) => {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const slug = this.taoSlug(text);
        
        headings.push({
          level,
          text,
          slug,
          line_number: index + 1
        });
      }
    });
    
    return headings;
  }

  /**
   * Tạo table of contents
   */
  private taoTableOfContents(headings: HeadingInfo[]): string {
    const lines = ['## Mục lục', ''];
    
    headings.forEach(heading => {
      const indent = '  '.repeat(heading.level - 1);
      lines.push(`${indent}- [${heading.text}](#${heading.slug})`);
    });
    
    return lines.join('\n');
  }

  /**
   * Tạo slug từ text
   */
  private taoSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
      .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
      .replace(/[ìíịỉĩ]/g, 'i')
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
      .replace(/[ùúụủũưừứựửữ]/g, 'u')
      .replace(/[ỳýỵỷỹ]/g, 'y')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Thêm syntax highlighting cho code blocks
   */
  themSyntaxHighlighting(markdown: string, default_language = ''): string {
    return markdown.replace(/```\n([\s\S]*?)\n```/g, (_match, code) => {
      const detected_language = this.phatHienNgonNguCode(code) || default_language;
      return `\`\`\`${detected_language}\n${code}\n\`\`\``;
    });
  }

  /**
   * Phát hiện ngôn ngữ lập trình từ code
   */
  private phatHienNgonNguCode(code: string): string {
    const patterns: Record<string, RegExp> = {
      javascript: /(?:function|var|let|const|=>|\.js)/i,
      typescript: /(?:interface|type|\.ts|import.*from)/i,
      python: /(?:def |import |from |\.py|print\()/i,
      java: /(?:public class|import java|\.java)/i,
      css: /(?:\{[\s\S]*?\}|\.css|@media)/i,
      html: /(?:<[^>]+>|\.html)/i,
      json: /^\s*[\{\[]/,
      sql: /(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE)/i,
      bash: /(?:#!\/bin\/bash|sudo |apt |yum )/i
    };
    
    for (const language of Object.keys(patterns)) {
      const pattern = patterns[language];
      if (pattern.test(code)) {
        return language;
      }
    }
    
    return '';
  }

  /**
   * Cải thiện formatting cho các element đặc biệt
   */
  caiThienFormatting(markdown: string): string {
    return markdown
      // Cải thiện table formatting
      .replace(/(\|.*\|)\n(\|.*\|)/g, (_match, header, row) => {
        const separator = header.replace(/[^|]/g, '-');
        return `${header}\n${separator}\n${row}`;
      })
      // Thêm line break trước headings
      .replace(/(\S)\n(#{1,6})/g, '$1\n\n$2')
      // Cải thiện list formatting
      .replace(/(\S)\n([*-])/g, '$1\n\n$2')
      .replace(/(\S)\n(\d+\.)/g, '$1\n\n$2');
  }

  /**
   * Escape các ký tự đặc biệt trong markdown
   */
  escapeMarkdown(text: string): string {
    const specialChars = ['*', '_', '`', '[', ']', '(', ')', '#', '+', '-', '.', '!', '\\'];
    
    let escaped = text;
    specialChars.forEach(char => {
      const regex = new RegExp(`\\${char}`, 'g');
      escaped = escaped.replace(regex, `\\${char}`);
    });
    
    return escaped;
  }

  /**
   * Optimize markdown để có kích thước nhỏ hơn
   */
  optimizeMarkdown(markdown: string): string {
    return markdown
      // Loại bỏ empty emphasis
      .replace(/\*\*\s*\*\*/g, '')
      .replace(/\*\s*\*/g, '')
      .replace(/__\s*__/g, '')
      .replace(/_\s*_/g, '')
      // Loại bỏ empty links
      .replace(/\[\s*\]\([^)]*\)/g, '')
      // Loại bỏ empty headers
      .replace(/^#{1,6}\s*$/gm, '')
      // Optimize whitespace
      .replace(/\n{4,}/g, '\n\n\n')
      .trim();
  }
}

/**
 * Interface cho metadata của markdown
 */
export interface MarkdownMetadata {
  title?: string;
  date?: Date;
  author?: string;
  source_url?: string;
  tags?: string[];
  description?: string;
  language?: string;
}

/**
 * Interface cho thông tin heading
 */
export interface HeadingInfo {
  level: number;
  text: string;
  slug: string;
  line_number: number;
}

/**
 * Utility functions để sử dụng trực tiếp
 */
export const chuyenHtmlSangMarkdown = (html: string): string => {
  const formatter = new DinhDangMarkdown();
  return formatter.htmlSangMarkdown(html);
};

export const chuyenElementSangMarkdown = (element: HTMLElement): string => {
  const formatter = new DinhDangMarkdown();
  return formatter.elementSangMarkdown(element);
};

export const lamSachMarkdown = (markdown: string): string => {
  const formatter = new DinhDangMarkdown();
  return formatter.lamSachMarkdown(markdown);
};

export const themMucLucVaoMarkdown = (markdown: string): string => {
  const formatter = new DinhDangMarkdown();
  return formatter.themMucLuc(markdown);
};
