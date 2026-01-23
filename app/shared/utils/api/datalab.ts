const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID || '';
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET || '';

export interface DatalabResult {
  title: string;
  keywords: string[];
  data: Array<{
    period: string;
    ratio: number;
  }>;
}

export interface DatalabResponse {
  startDate: string;
  endDate: string;
  timeUnit: string;
  results: DatalabResult[];
}

export const fetchDatalabTrend = async (
  keywords: string[],
  timeUnit: 'date' | 'week' | 'month' = 'month'
): Promise<DatalabResponse> => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const keywordGroups = keywords.map((kw) => ({
    groupName: kw,
    keywords: [kw],
  }));

  const response = await fetch('https://openapi.naver.com/v1/datalab/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Naver-Client-Id': NAVER_CLIENT_ID,
      'X-Naver-Client-Secret': NAVER_CLIENT_SECRET,
    },
    body: JSON.stringify({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      timeUnit,
      keywordGroups,
    }),
  });

  if (!response.ok) {
    throw new Error(`네이버 API 오류: ${response.status}`);
  }

  return response.json();
};
