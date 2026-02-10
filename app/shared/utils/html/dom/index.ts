import * as cheerio from 'cheerio';
import type { CheerioAPI } from 'cheerio';

export const loadHtml = (html: string): CheerioAPI => cheerio.load(html);

export const extractTextsBySelector = (
  $: CheerioAPI,
  selector: string,
  minLength = 5
): string[] => {
  const results: string[] = [];
  $(selector).each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length >= minLength) results.push(text);
  });
  return [...new Set(results)];
};

export const removeDragPrevention = ($: CheerioAPI) => {
  $('*').each((_, element) => {
    const $element = $(element as any);
    $element.removeAttr('onselectstart');
    $element.removeAttr('ondragstart');
    $element.removeAttr('oncontextmenu');
    $element.removeAttr('unselectable');
    $element.css('user-select', 'auto');
    $element.css('-webkit-user-select', 'auto');
    $element.css('-moz-user-select', 'auto');
    $element.css('-ms-user-select', 'auto');
  });
};

export const removeScriptsByKeywords = ($: CheerioAPI, keywords: string[]) => {
  $('script').each((_, script) => {
    const scriptText = $(script as any).html() || '';
    if (keywords.some((k) => scriptText.includes(k))) {
      $(script as any).remove();
    }
  });
};

