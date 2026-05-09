/**
 * Converts HTML to Markdown format
 * @param html - HTML string to convert
 * @returns Markdown formatted string
 */
export function convertHtmlToMarkdown(html: string): string {
  if (!html) return '';

  let markdown = html;

  // Remove script and style elements completely
  markdown = markdown.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // Convert headers
  markdown = markdown.replace(/<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi, (match, level, content) => {
    const hashes = '#'.repeat(parseInt(level));
    return `${hashes} ${content.trim()}`;
  });

  // Convert bold/strong
  markdown = markdown.replace(/<(b|strong)[^>]*>(.*?)<\/(b|strong)>/gi, '**$2**');

  // Convert italic/emphasis
  markdown = markdown.replace(/<(i|em)[^>]*>(.*?)<\/(i|em)>/gi, '*$2*');

  // Convert strikethrough
  markdown = markdown.replace(/<(s|strike|del)[^>]*>(.*?)<\/(s|strike|del)>/gi, '~~$2~~');

  // Convert code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

  // Convert pre blocks
  markdown = markdown.replace(/<pre[^>]*>(.*?)<\/pre>/gi, (match, content) => {
    return `\n\`\`\`\n${content.trim()}\n\`\`\`\n`;
  });

  // Convert blockquotes
  markdown = markdown.replace(/<blockquote[^>]*>(.*?)<\/blockquote>/gi, (match, content) => {
    const lines = content.trim().split('\n');
    return lines.map(line => `> ${line.trim()}`).join('\n');
  });

  // Convert links
  markdown = markdown.replace(/<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi, '[$2]($1)');

  // Convert images
  markdown = markdown.replace(/<img[^>]*src=["']([^"']*)["'][^>]*(?:alt=["']([^"']*)["'])?[^>]*>/gi, (match, src, alt) => {
    return `![${alt || ''}](${src})`;
  });

  // Convert lists
  // Unordered lists
  markdown = markdown.replace(/<ul[^>]*>(.*?)<\/ul>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (items) {
      return items.map(item => {
        const text = item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').trim();
        return `- ${text}`;
      }).join('\n');
    }
    return content;
  });

  // Ordered lists
  markdown = markdown.replace(/<ol[^>]*>(.*?)<\/ol>/gi, (match, content) => {
    const items = content.match(/<li[^>]*>(.*?)<\/li>/gi);
    if (items) {
      return items.map((item, index) => {
        const text = item.replace(/<li[^>]*>(.*?)<\/li>/i, '$1').trim();
        return `${index + 1}. ${text}`;
      }).join('\n');
    }
    return content;
  });

  // Convert line breaks
  markdown = markdown.replace(/<br\s*\/?>/gi, '\n');
  markdown = markdown.replace(/<\/p>/gi, '\n\n');
  markdown = markdown.replace(/<\/div>/gi, '\n');

  // Convert horizontal rules
  markdown = markdown.replace(/<hr[^>]*\/?>/gi, '\n---\n');

  // Remove remaining HTML tags
  markdown = markdown.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  markdown = markdown
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™');

  // Clean up extra whitespace and newlines
  markdown = markdown
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newlines
    .replace(/[ \t]+/g, ' ') // Replace multiple spaces/tabs with single space
    .trim();

  return markdown;
}

/**
 * Converts HTML to plain text (strips all HTML tags)
 * @param html - HTML string to convert
 * @returns Plain text string
 */
export function convertHtmlToPlainText(html: string): string {
  if (!html) return '';

  let text = html;

  // Remove script and style elements completely
  text = text.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, '');

  // Remove all HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Decode HTML entities
  text = text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™');

  // Clean up whitespace
  text = text
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}