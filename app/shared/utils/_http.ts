import { NAVER_DESKTOP_HEADERS } from '@/constants';
export { NAVER_DESKTOP_HEADERS };

/**
 * 네이버 로그인 상태 확인 및 로그
 */
export const logNaverAuthStatus = (): void => {
  const nidAut = process.env.NAVER_NID_AUT;
  const nidSes = process.env.NAVER_NID_SES;
  const mLoc = process.env.NAVER_M_LOC;

  console.log('\n┌─────────────────────────────────────┐');
  console.log('│      🔐 네이버 크롤링 인증 상태      │');
  console.log('├─────────────────────────────────────┤');

  if (nidAut && nidSes) {
    console.log('│  ✅ 로그인 모드 (쿠키 설정됨)       │');
    console.log(`│  • NID_AUT: ${nidAut.slice(0, 10)}...       │`);
    console.log(`│  • NID_SES: ${nidSes.slice(0, 10)}...       │`);
    console.log(`│  • M_LOC:   ${mLoc ? '설정됨' : '미설정'}              │`);
  } else {
    console.log('│  ⚠️  비로그인 모드 (쿠키 없음)       │');
    console.log('│  • 일부 콘텐츠 제한될 수 있음       │');
  }

  console.log('└─────────────────────────────────────┘\n');
};

/**
 * 네이버 로그인 쿠키 빌드
 * 환경변수: NAVER_NID_AUT, NAVER_NID_SES, NAVER_M_LOC (선택)
 * 쿠키 없으면 undefined 반환 (비로그인 크롤링)
 */
export const buildNaverCookie = (): string | undefined => {
  const nidAut = process.env.NAVER_NID_AUT;
  const nidSes = process.env.NAVER_NID_SES;
  const mLoc = process.env.NAVER_M_LOC;

  if (nidAut && nidSes) {
    let cookie = `NID_AUT=${nidAut}; NID_SES=${nidSes}`;
    if (mLoc) {
      cookie += `; m_loc=${mLoc}`;
    }
    return cookie;
  }
  return undefined;
};

/**
 * 네이버 쿠키 포함 헤더 빌드
 */
export const buildNaverHeaders = (
  baseHeaders: Record<string, string> = NAVER_DESKTOP_HEADERS
): Record<string, string> => {
  const headers = { ...baseHeaders };
  const cookie = buildNaverCookie();

  if (cookie) {
    headers.Cookie = cookie;
  }

  return headers;
};

export const fetchHtml = async (
  url: string,
  headers?: Record<string, string>
): Promise<string> => {
  const finalHeaders = headers ?? buildNaverHeaders();
  const res = await fetch(url, { headers: finalHeaders });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

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

// 서버 시작 시 인증 상태 로그 (한 번만)
if (typeof process !== 'undefined' && process.env) {
  logNaverAuthStatus();
}
