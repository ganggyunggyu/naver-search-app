export const normalizeImageSrc = (
  src?: string | null,
  base: string = 'https://blog.naver.com'
): string | null => {
  if (!src) return null;
  let out = src;
  if (out.startsWith('//')) out = 'https:' + out;
  else if (out.startsWith('/')) out = base.replace(/\/$/, '') + out;

  if (out.includes('postfiles.pstatic.net')) {
    out = out.replace(/\?type=w\d+/, '?type=w2000');
  }

  if (!out.startsWith('http')) return null;
  if (out.includes('icon') || out.includes('emoticon') || out.includes('profile')) return null;
  return out;
};

