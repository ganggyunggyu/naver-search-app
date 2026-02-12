import crypto from 'crypto';

const API_KEY = process.env.NAVER_AD_API_KEY || '';
const SECRET_KEY = process.env.NAVER_AD_SECRET_KEY || '';
const CUSTOMER_ID = process.env.NAVER_AD_CUSTOMER_ID || '';

const BASE_URL = 'https://api.naver.com';

export interface KeywordStat {
  relKeyword: string;
  monthlyPcQcCnt: number;
  monthlyMobileQcCnt: number;
  monthlyAvePcClkCnt: number;
  monthlyAveMobileClkCnt: number;
  monthlyAvePcCtr: number;
  monthlyAveMobileCtr: number;
  plAvgDepth: number;
  compIdx: string;
}

export interface KeywordToolResponse {
  keywordList: KeywordStat[];
}

const generateSignature = (timestamp: string, method: string, uri: string): string => {
  const message = `${timestamp}.${method}.${uri}`;
  return crypto.createHmac('sha256', SECRET_KEY).update(message).digest('base64');
};

export const fetchKeywordStats = async (keywords: string[]): Promise<KeywordStat[]> => {
  if (!API_KEY || !SECRET_KEY || !CUSTOMER_ID) {
    throw new Error('검색광고 API 키가 설정되지 않았습니다. NAVER_AD_API_KEY, NAVER_AD_SECRET_KEY, NAVER_AD_CUSTOMER_ID 환경변수를 설정하세요.');
  }

  // 키워드 정리: 빈 값 제거, 최대 5개까지만
  const cleanKeywords = keywords
    .map((k) => k.trim())
    .filter((k) => k.length > 0)
    .slice(0, 5);

  if (cleanKeywords.length === 0) {
    throw new Error('유효한 키워드가 없습니다.');
  }

  const timestamp = String(Date.now());
  const method = 'GET';
  const uri = '/keywordstool';
  const signature = generateSignature(timestamp, method, uri);

  const params = new URLSearchParams({
    hintKeywords: cleanKeywords.join(','),
    showDetail: '1',
  });

  const response = await fetch(`${BASE_URL}${uri}?${params}`, {
    method,
    headers: {
      'X-Timestamp': timestamp,
      'X-API-KEY': API_KEY,
      'X-Customer': CUSTOMER_ID,
      'X-Signature': signature,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SearchAd API Error:', { status: response.status, body: errorText, keywords: cleanKeywords });
    throw new Error(`검색광고 API 오류: ${response.status} - ${errorText}`);
  }

  const data: KeywordToolResponse = await response.json();
  return data.keywordList || [];
};
