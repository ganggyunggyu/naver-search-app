import { loadHtml } from './html';
import { extractTextsBySelector } from './html';
import { buildClassSelector } from './html';
import { SEARCH_PARTIAL_SELECTORS } from '@/constants';

export const extractTextsFromSearch = (html: string, className: string): string[] => {
  const $ = loadHtml(html);
  const results: string[] = [];
  const classSelector = buildClassSelector(className);

  extractTextsBySelector($, classSelector, 5).forEach((t) => results.push(t));

  if (results.length === 0) {
    for (const selector of SEARCH_PARTIAL_SELECTORS) {
      const texts = extractTextsBySelector($, selector, 5);
      for (const t of texts) if (!results.includes(t)) results.push(t);
      if (results.length > 0) break;
    }
  }

  if (results.length === 0) {
    $('h1, h2, h3, h4, h5, h6, p, div, span').each((_, element) => {
      const text = $(element as any).text().trim();
      if (text && text.length > 10 && text.length < 500) results.push(text);
    });
  }

  return [...new Set(results)];
};
