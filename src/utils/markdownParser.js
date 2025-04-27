// Markdown parser utility
// Extracted from ai-qa.vue for reuse

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Parse inline Markdown elements
 */
function parseInline(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`);
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const safeUrl = url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') ? url : '#';
    return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  });
  html = html.replace(/(https?:\/\/[^\s<]+)/g, (_, url) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(url)}</a>`);
  return html;
}

/**
 * Parse full Markdown text into HTML
 */
function parseMarkdown(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeLang = '';
  let codeContent = [];
  let inListType = null;
  let currentParagraph = [];

  const closeList = () => {
    if (inListType === 'ul') html += '</ul>\n';
    if (inListType === 'ol') html += '</ol>\n';
    inListType = null;
  };

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join('\n');
      html += `<p>${parseInline(paragraphText)}</p>\n`;
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      flushParagraph();
      closeList();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.trim().substring(3).trim();
        codeContent = [];
      } else {
        const langClass = codeLang ? `language-${escapeHtml(codeLang)}` : '';
        const escaped = codeContent.map(l => escapeHtml(l)).join('\n');
        html += `<pre><code class="${langClass}">${escaped}</code></pre>\n`;
        inCodeBlock = false;
        codeLang = '';
      }
      continue;
    }
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }
    if (line.trim() === '') {
      flushParagraph();
      closeList();
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph();
      closeList();
      html += `<h3>${parseInline(line.substring(4))}</h3>\n`;
      continue;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      closeList();
      html += `<h2>${parseInline(line.substring(3))}</h2>\n`;
      continue;
    }
    if (line.startsWith('# ')) {
      flushParagraph();
      closeList();
      html += `<h1>${parseInline(line.substring(2))}</h1>\n`;
      continue;
    }
    const ulMatch = line.match(/^- (.+)/);
    const olMatch = line.match(/^\d+\. (.+)/);
    if (ulMatch) {
      flushParagraph();
      if (inListType !== 'ul') {
        closeList();
        html += '<ul>\n';
        inListType = 'ul';
      }
      html += `<li>${parseInline(ulMatch[1])}</li>\n`;
      continue;
    }
    if (olMatch) {
      flushParagraph();
      if (inListType !== 'ol') {
        closeList();
        html += '<ol>\n';
        inListType = 'ol';
      }
      html += `<li>${parseInline(olMatch[1])}</li>\n`;
      continue;
    }
    if (line.startsWith('> ')) {
      flushParagraph();
      closeList();
      html += `<blockquote><p>${parseInline(line.substring(2))}</p></blockquote>\n`;
      continue;
    }
    currentParagraph.push(line);
  }
  flushParagraph();
  closeList();
  return `<div class="markdown-body">${html.trim()}</div>`;
}

export { escapeHtml, parseInline, parseMarkdown };
