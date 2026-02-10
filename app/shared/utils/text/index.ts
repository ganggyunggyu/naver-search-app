export const cleanText = (text: string): string =>
  text.replace(/Previous image|Next image/g, '').replace(/\s+/g, ' ').trim();

// Normalize manuscript text similar to copy routines
// - Preserve line breaks
// - Collapse consecutive spaces/tabs/NBSP to single space
// - Limit 3+ consecutive newlines to 2
// - Trim trailing spaces per line and overall
export const normalizeForCopy = (text: string): string => {
  const t = String(text || '');
  return t
    .replace(/\r\n?/g, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/[ \t\f\v\u00A0]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((l) => l.replace(/[ \t\f\v\u00A0]+$/g, ''))
    .join('\n')
    .trim();
};

export const isMeaningfulText = (
  text: string,
  opts: { min?: number; max?: number } = {}
): boolean => {
  const { min = 10, max = 500 } = opts;
  if (!text) return false;
  const t = text.trim();
  if (t.length < min || t.length > max) return false;
  if (
    t.includes('댓글') ||
    t.includes('공유') ||
    t.includes('구독') ||
    t.includes('좋아요') ||
    /^\d+\.\s*$/.test(t) ||
    /^[^\w\s가-힣]+$/.test(t)
  )
    return false;
  return true;
};
