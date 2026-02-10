import { NAVER_DESKTOP_HEADERS } from '@/constants';
export { NAVER_DESKTOP_HEADERS };

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

/**
 * 네이버 로그인 실제 검증
 * 네이버 메인 페이지를 요청해서 로그인 여부 확인
 */
export const verifyNaverLogin = async (): Promise<{
  isLoggedIn: boolean;
  userId?: string;
  error?: string;
}> => {
  const cookie = buildNaverCookie();
  if (!cookie) {
    return { isLoggedIn: false, error: '쿠키 미설정' };
  }

  try {
    const res = await fetch('https://www.naver.com/', {
      headers: {
        ...NAVER_DESKTOP_HEADERS,
        Cookie: cookie,
      },
    });

    const html = await res.text();

    // 로그인 상태 확인: "로그인" 버튼이 있으면 비로그인, 없으면 로그인 상태
    const hasLoginButton =
      html.includes('class="MyView-module__link_login') ||
      html.includes('로그인</a>') ||
      html.includes('btn_login');

    // 로그인된 경우 사용자 ID 추출 시도
    const userIdMatch = html.match(/gnb_my_namebox[^>]*>([^<]+)</);
    const userId = userIdMatch?.[1]?.trim();

    return {
      isLoggedIn: !hasLoginButton,
      userId: userId || undefined,
    };
  } catch (err) {
    return {
      isLoggedIn: false,
      error: err instanceof Error ? err.message : '검증 실패',
    };
  }
};

/**
 * 네이버 로그인 상태 확인 및 로그
 */
export const logNaverAuthStatus = async (): Promise<void> => {
  const nidAut = process.env.NAVER_NID_AUT;
  const nidSes = process.env.NAVER_NID_SES;

  console.log('\n┌─────────────────────────────────────┐');
  console.log('│      🔐 네이버 크롤링 인증 상태      │');
  console.log('├─────────────────────────────────────┤');

  if (nidAut && nidSes) {
    console.log('│  📋 쿠키 설정됨 - 검증 중...        │');

    const { isLoggedIn, userId, error } = await verifyNaverLogin();

    if (isLoggedIn) {
      console.log('│  ✅ 로그인 확인됨!                  │');
      if (userId) {
        console.log(`│  • 사용자: ${userId.padEnd(20)}│`);
      }
    } else {
      console.log('│  ❌ 로그인 실패 (쿠키 만료/무효)   │');
      if (error) {
        console.log(`│  • 오류: ${error.slice(0, 22).padEnd(22)}│`);
      }
    }
  } else {
    console.log('│  ⚠️  비로그인 모드 (쿠키 없음)       │');
    console.log('│  • 일부 콘텐츠 제한될 수 있음       │');
  }

  console.log('└─────────────────────────────────────┘\n');
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

export const fetchNaverOpenApi = async <T = unknown>(
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
  logNaverAuthStatus().catch(console.error);
}
