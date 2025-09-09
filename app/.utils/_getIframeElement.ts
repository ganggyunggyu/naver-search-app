import * as cheerio from 'cheerio';

export const getIframeElement = (
  html: string,
  baseUrl: string = 'https://blog.naver.com'
): { src: string | null; url: string | null } => {
  try {
    const $ = cheerio.load(html);
    const rawSrc = $('#mainFrame').attr('src') || $('iframe').attr('src') || null;
    if (!rawSrc) return { src: null, url: null };

    let absoluteUrl: string | null = null;
    if (rawSrc.startsWith('//')) {
      absoluteUrl = 'https:' + rawSrc;
    } else if (rawSrc.startsWith('/')) {
      absoluteUrl = baseUrl.replace(/\/$/, '') + rawSrc;
    } else if (rawSrc.startsWith('http')) {
      absoluteUrl = rawSrc;
    } else {
      try {
        absoluteUrl = new URL(rawSrc, baseUrl).toString();
      } catch {
        absoluteUrl = null;
      }
    }

    return { src: rawSrc, url: absoluteUrl };
  } catch {
    return { src: null, url: null };
  }
};

