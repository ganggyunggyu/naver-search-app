import { NAVER_DESKTOP_HEADERS, NAVER_MOBILE_HEADERS } from '@/constants';
export { NAVER_DESKTOP_HEADERS, NAVER_MOBILE_HEADERS };

export const fetchHtml = async (
  url: string,
  headers: Record<string, string> = NAVER_DESKTOP_HEADERS
): Promise<string> => {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  console.log(res.text);
  return await res.text();
};

export const fetchNaverOpenApi = async <T = any>(
  endpoint: string,
  params: Record<string, string>
): Promise<T> => {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${endpoint}?${qs}`, {
    headers: {
      'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID || '',
      'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET || '',
    },
  });
  if (!res.ok) throw new Error(`Naver API 오류: ${res.status}`);
  return (await res.json()) as T;
};
