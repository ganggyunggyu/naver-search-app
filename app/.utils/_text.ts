export const cleanText = (text: string): string =>
  text.replace(/Previous image|Next image/g, '').replace(/\s+/g, ' ').trim();

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

