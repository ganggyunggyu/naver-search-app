import 'dotenv/config';
import * as cheerio from 'cheerio';

export interface LoginStatus {
  isLoggedIn: boolean;
  userName?: string;
  email?: string;
}

export async function checkNaverLogin(): Promise<LoginStatus> {
  const { gotScraping } = await import('got-scraping');

  const nidAut = process.env.NAVER_NID_AUT;
  const nidSes = process.env.NAVER_NID_SES;
  const mLoc = process.env.NAVER_M_LOC;

  if (!nidAut || !nidSes) {
    return { isLoggedIn: false };
  }

  let cookie = `NID_AUT=${nidAut}; NID_SES=${nidSes}`;
  if (mLoc) cookie += `; m_loc=${mLoc}`;

  try {
    const res = await gotScraping.get(
      'https://nid.naver.com/user2/help/myInfoV2?lang=ko_KR',
      {
        headers: {
          Cookie: cookie,
          Referer: 'https://nid.naver.com/',
          'Accept-Language': 'ko-KR,ko;q=0.9',
        },
        http2: true,
        followRedirect: true,
        throwHttpErrors: false,
      }
    );

    if (res.statusCode !== 200) {
      return { isLoggedIn: false };
    }

    const $ = cheerio.load(res.body);
    const userName = $('.name').text().trim().split('\n')[0].trim();
    const profileText = $('.profile_area').text();
    const emailMatch = profileText.match(/([a-zA-Z0-9._-]+@naver\.com)/);

    if (userName) {
      return {
        isLoggedIn: true,
        userName,
        email: emailMatch?.[1],
      };
    }

    return { isLoggedIn: false };
  } catch {
    return { isLoggedIn: false };
  }
}

async function main() {
  const nidAut = process.env.NAVER_NID_AUT;
  const nidSes = process.env.NAVER_NID_SES;
  const mLoc = process.env.NAVER_M_LOC;

  console.log('=== 쿠키 설정 상태 ===');
  console.log('NID_AUT:', nidAut ? '✅ 설정됨' : '❌ 없음');
  console.log('NID_SES:', nidSes ? '✅ 설정됨' : '❌ 없음');
  console.log('m_loc:', mLoc ? '✅ 설정됨' : '❌ 없음');
  console.log('');

  console.log('=== 로그인 상태 확인 ===');
  const status = await checkNaverLogin();

  if (status.isLoggedIn) {
    console.log(`✅ 로그인 확인됨! (${status.userName})`);
    if (status.email) {
      console.log(`   이메일: ${status.email}`);
    }
  } else {
    console.log('❌ 비로그인 상태');
  }
}

main().catch(console.error);
