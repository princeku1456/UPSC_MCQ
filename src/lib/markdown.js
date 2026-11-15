import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(text) {
  const rawHtml = marked.parse(text || '');
  return DOMPurify.sanitize(rawHtml);
}

export default renderMarkdown;
