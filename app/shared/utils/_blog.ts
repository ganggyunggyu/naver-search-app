const NAVER_BLOG_HOSTS = [
  'blog.naver.com',
  'm.blog.naver.com',
  'in.naver.com',
] as const;

const isNaverBlogHost = (hostname: string): boolean =>
  NAVER_BLOG_HOSTS.some((host) => hostname.includes(host));

export const extractBlogIdFromUrl = (url: string): string => {
  if (!url) return '';

  try {
    const parsed = new URL(url);

    if (isNaverBlogHost(parsed.hostname)) {
      const pathSegment = parsed.pathname.replace(/^\//, '').split('/')[0];
      return (pathSegment ?? '').toLowerCase();
    }
  } catch {
    // URL 파싱 실패 시 정규식으로 시도
    const patterns = [
      /blog\.naver\.com\/([^/?&#]+)/,
      /m\.blog\.naver\.com\/([^/?&#]+)/,
      /in\.naver\.com\/([^/?&#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match?.[1]) return match[1].toLowerCase();
    }
  }

  return '';
};

export const isValidNaverBlogPost = (link: string): boolean => {
  try {
    const url = new URL(link);
    if (isNaverBlogHost(url.hostname)) {
      const pathParts = url.pathname.replace(/^\//, '').split('/');
      return pathParts.length >= 2 && !!pathParts[0] && !!pathParts[1];
    }
    return true;
  } catch {
    return false;
  }
};
