import { fetchHtml, NAVER_MOBILE_HEADERS } from '@/shared/utils/_http';
import { loadHtml, extractTextsBySelector } from '@/shared/utils/html';
import type { BlogCrawlItem, BlogCrawlResponse } from './_types';


/**
 * 네이버 모바일 블로그 검색 페이지 크롤링
 * @param keyword 검색 키워드
 * @returns 크롤링 결과
 */
export const crawlNaverBlogSearch = async (keyword: string): Promise<BlogCrawlResponse> => {
  // 네이버 모바일 블로그 검색 URL 생성 (최대한 많은 결과를 위해 파라미터 추가)
  const searchUrl = `https://m.search.naver.com/search.naver?ssc=tab.m_blog.all&sm=mtb_jum&query=${encodeURIComponent(keyword)}&start=1&display=500&sort=sim`;
  
  try {
    console.log(`🕷️ 네이버 모바일 블로그 검색 크롤링 시작: "${keyword}"`);
    console.log(`📍 크롤링 URL: ${searchUrl}`);
    
    // HTML 가져오기
    const html = await fetchHtml(searchUrl, NAVER_MOBILE_HEADERS);
    const $ = loadHtml(html);
    
    const items: BlogCrawlItem[] = [];
    
    // 블로그 검색 결과 파싱 (여러 선택자 시도)
    const blogSelectors = [
      '.lst_total .bx',           // 일반적인 블로그 결과
      '.lst_type .bx',            // 타입별 결과
      '.total_wrap .bx',          // 전체 래퍼 내 결과
      '[data-cr-area="lst_total"] .bx', // 데이터 속성 기반
      '.api_ani_send',            // API 애니메이션 영역
      '.sc_new .bx',              // 새로운 스타일
    ];
    
    let foundResults = false;
    
    for (const selector of blogSelectors) {
      const blogElements = $(selector);
      
      if (blogElements.length > 0) {
        console.log(`✅ 블로그 요소 발견: ${selector} (${blogElements.length}개)`);
        foundResults = true;
        
        blogElements.each((_, element) => {
          const $el = $(element);
          
          // 제목과 링크 추출
          const titleEl = $el.find('a.title, .title a, .tit_area a, h2 a, h3 a').first();
          const title = titleEl.text().trim();
          const link = titleEl.attr('href') || '';
          
          // 요약 추출
          const descEl = $el.find('.dsc, .desc, .detail_txt, .api_txt_lines').first();
          const description = descEl.text().trim();
          
          // 블로그 정보 추출
          const blogEl = $el.find('.name, .sub_txt, .source, .blog_name').first();
          const blogInfo = blogEl.text().trim();
          
          // 날짜 추출
          const dateEl = $el.find('.date, .sub_time, .time').first();
          const date = dateEl.text().trim();
          
          // 썸네일 추출
          const thumbEl = $el.find('img').first();
          const thumbnail = thumbEl.attr('src') || thumbEl.attr('data-src') || '';
          
          if (title && link) {
            // 광고 링크 필터링 (ader.naver.com 제외)
            const fullLink = link.startsWith('http') ? link : `https://m.search.naver.com${link}`;
            
            // 유효한 블로그 포스트 링크인지 확인 (포스트 ID 있는지 체크)
            const isValidBlogPost = () => {
              try {
                const url = new URL(fullLink);
                if (url.hostname.includes('blog.naver.com') || url.hostname.includes('m.blog.naver.com')) {
                  const pathParts = url.pathname.replace(/^\//, '').split('/');
                  // 블로그 ID와 포스트 ID가 모두 있어야 함
                  return pathParts.length >= 2 && pathParts[0] && pathParts[1];
                }
                return true; // 네이버 블로그가 아닌 경우는 통과
              } catch {
                return false;
              }
            };
            
            if (!fullLink.includes('ader.naver.com') && isValidBlogPost()) {
              items.push({
                title: title.replace(/<\/?[^>]+(>|$)/g, ''), // HTML 태그 제거
                link: fullLink,
                description: description.replace(/<\/?[^>]+(>|$)/g, ''),
                blogName: blogInfo,
                date: date,
                thumbnail: thumbnail,
              });
            } else {
              if (fullLink.includes('ader.naver.com')) {
                console.log(`⛔ 광고 링크 제외: ${fullLink.substring(0, 50)}...`);
              } else {
                console.log(`⛔ 유효하지 않은 포스트 링크 제외: ${fullLink.substring(0, 50)}...`);
              }
            }
          }
        });
        
        break; // 결과를 찾았으면 다른 선택자는 시도하지 않음
      }
    }
    
    // 결과가 없으면 일반적인 링크 요소들 시도
    if (!foundResults) {
      console.log('⚠️ 기본 선택자로 결과 없음, 일반 링크 요소 시도');
      
      const generalLinks = $('a[href*="blog"], a[href*="post"]');
      generalLinks.each((_, element) => {
        const $el = $(element);
        const title = $el.text().trim();
        const link = $el.attr('href') || '';
        
        if (title.length > 10 && link) {
          // 광고 링크 필터링 (ader.naver.com 제외)
          const fullLink = link.startsWith('http') ? link : `https://m.search.naver.com${link}`;
          
          // 유효한 블로그 포스트 링크인지 확인 (포스트 ID 있는지 체크)
          const isValidBlogPost = () => {
            try {
              const url = new URL(fullLink);
              if (url.hostname.includes('blog.naver.com') || url.hostname.includes('m.blog.naver.com')) {
                const pathParts = url.pathname.replace(/^\//, '').split('/');
                // 블로그 ID와 포스트 ID가 모두 있어야 함
                return pathParts.length >= 2 && pathParts[0] && pathParts[1];
              }
              return true; // 네이버 블로그가 아닌 경우는 통과
            } catch {
              return false;
            }
          };
          
          if (!fullLink.includes('ader.naver.com') && isValidBlogPost()) {
            // 상위 요소에서 추가 정보 찾기
            const parent = $el.closest('div, li, article, section');
            const description = parent.find('p, span, div').not($el).text().trim().slice(0, 200);
            
            items.push({
              title: title.replace(/<\/?[^>]+(>|$)/g, ''),
              link: fullLink,
              description: description.replace(/<\/?[^>]+(>|$)/g, ''),
            });
          } else {
            if (fullLink.includes('ader.naver.com')) {
              console.log(`⛔ 광고 링크 제외: ${fullLink.substring(0, 50)}...`);
            } else {
              console.log(`⛔ 유효하지 않은 포스트 링크 제외: ${fullLink.substring(0, 50)}...`);
            }
          }
        }
      });
    }
    
    // 중복 제거
    const uniqueItems = items.filter((item, index, self) => 
      index === self.findIndex(t => t.link === item.link)
    );

    // 연속된 같은 블로그 ID 중복 제거 (첫 번째만 유지)
    const getBlogIdFromLink = (link: string): string => {
      try {
        const url = new URL(link);
        if (url.hostname.includes('blog.naver.com') || url.hostname.includes('m.blog.naver.com')) {
          const pathParts = url.pathname.replace(/^\//, '').split('/');
          return pathParts[0] || '';
        }
      } catch {}
      return '';
    };

    const deduplicatedItems: BlogCrawlItem[] = [];
    let lastBlogId = '';
    
    for (const item of uniqueItems) {
      const currentBlogId = getBlogIdFromLink(item.link);
      
      if (currentBlogId && currentBlogId === lastBlogId) {
        // 연속된 같은 블로그는 건너뛰기
        console.log(`⛔ 연속 중복 블로그 제외: ${currentBlogId} - ${item.title.substring(0, 30)}...`);
        continue;
      }
      
      deduplicatedItems.push(item);
      lastBlogId = currentBlogId;
    }
    
    console.log(`🎯 크롤링 완료: ${deduplicatedItems.length}개 결과 추출 (원본: ${uniqueItems.length}개)`);
    
    return {
      keyword,
      items: deduplicatedItems,
      total: deduplicatedItems.length,
      url: searchUrl,
    };
    
  } catch (error) {
    console.error('🚨 네이버 블로그 크롤링 오류:', error);
    throw new Error(`블로그 크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
  }
};

/**
 * 블로그 크롤링 결과를 콘솔에 예쁘게 출력
 */
export const logBlogCrawlResults = (response: BlogCrawlResponse) => {
  console.log('\n🕷️ ====== 네이버 블로그 크롤링 결과 ======');
  console.log(`🔍 검색어: "${response.keyword}"`);
  console.log(`📊 크롤링 결과: ${response.total}개`);
  console.log(`🌐 크롤링 URL: ${response.url}`);
  console.log('==========================================\n');

  response.items.forEach((item, index) => {
    console.log(`${index + 1}. 📝 ${item.title}`);
    if (item.blogName) console.log(`   🏠 블로그: ${item.blogName}`);
    if (item.date) console.log(`   📅 날짜: ${item.date}`);
    console.log(`   🔗 링크: ${item.link}`);
    if (item.description) {
      console.log(`   📄 요약: ${item.description.slice(0, 100)}${item.description.length > 100 ? '...' : ''}`);
    }
    console.log('   ─────────────────────────────────────────');
  });

  console.log('\n🎯 === 크롤링 완료 === 🎯\n');
};