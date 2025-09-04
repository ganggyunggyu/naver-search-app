import type { Route } from "./+types/api.search";

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const display = url.searchParams.get("display") || "10";
  const start = url.searchParams.get("start") || "1";
  const sort = url.searchParams.get("sort") || "sim"; // sim(정확도순), date(날짜순)

  if (!query) {
    return Response.json({ 
      error: "검색어가 필요합니다.", 
      status: 400 
    }, { status: 400 });
  }

  try {
    const response = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`,
      {
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID || '',
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET || '',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Naver API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    return Response.json({
      total: data.total,
      start: data.start,
      display: data.display,
      items: data.items || [],
      query,
      status: 200
    });

  } catch (error) {
    console.error('Search API error:', error);
    return Response.json({ 
      error: '검색 중 오류가 발생했습니다.', 
      status: 500 
    }, { status: 500 });
  }
}