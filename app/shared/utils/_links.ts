export const normalizeLink = (href?: string, cru?: string): string => {
  if (cru && cru.startsWith('http')) return cru;
  if (!href) return '';
  try {
    const uParam = new URLSearchParams(href.split('?')[1] || '').get('u');
    if (uParam) return decodeURIComponent(uParam);
  } catch {}
  if (href.startsWith('/')) return `https://search.naver.com${href}`;
  return href;
};

export const buildNaverSearchUrl = (query: string): string =>
  `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=1&ie=utf8&query=${encodeURIComponent(
    query
  )}`;
