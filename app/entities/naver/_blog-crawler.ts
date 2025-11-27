import { fetchHtml, NAVER_MOBILE_HEADERS } from '@/shared/utils/_http';
import { loadHtml } from '@/shared/utils/html';
import type { BlogCrawlItem, BlogCrawlResponse } from './_types';

const BLOG_SELECTORS = [
  '.lst_total .bx',
  '.lst_type .bx',
  '.total_wrap .bx',
  '[data-cr-area="lst_total"] .bx',
  '.api_ani_send',
  '.sc_new .bx',
] as const;

const TITLE_SELECTORS = 'a.title, .title a, .tit_area a, h2 a, h3 a';
const DESC_SELECTORS = '.dsc, .desc, .detail_txt, .api_txt_lines';
const BLOG_INFO_SELECTORS = '.name, .sub_txt, .source, .blog_name';

const stripHtmlTags = (text: string): string =>
  text.replace(/<\/?[^>]+(>|$)/g, '');

const isNaverBlogHost = (hostname: string): boolean =>
  hostname.includes('blog.naver.com') || hostname.includes('m.blog.naver.com');

const isValidNaverBlogPost = (link: string): boolean => {
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

const getBlogIdFromLink = (link: string): string => {
  try {
    const url = new URL(link);
    if (isNaverBlogHost(url.hostname)) {
      const pathParts = url.pathname.replace(/^\//, '').split('/');
      return pathParts[0] || '';
    }
  } catch {}
  return '';
};

const isAdLink = (link: string): boolean => link.includes('ader.naver.com');

const buildFullLink = (link: string): string =>
  link.startsWith('http') ? link : `https://m.search.naver.com${link}`;

export const crawlNaverBlogSearch = async (
  keyword: string
): Promise<BlogCrawlResponse> => {
  const searchUrl = `https://m.search.naver.com/search.naver?ssc=tab.m_blog.all&sm=mtb_jum&query=${encodeURIComponent(keyword)}&start=1&display=500&sort=sim`;

  try {
    const html = await fetchHtml(searchUrl, NAVER_MOBILE_HEADERS);
    const $ = loadHtml(html);
    const items: BlogCrawlItem[] = [];

    let foundResults = false;

    for (const selector of BLOG_SELECTORS) {
      const blogElements = $(selector);

      if (blogElements.length > 0) {
        foundResults = true;

        blogElements.each((_, element) => {
          const $el = $(element);

          const titleEl = $el.find(TITLE_SELECTORS).first();
          const title = titleEl.text().trim();
          const link = titleEl.attr('href') || '';

          if (!title || !link) return;

          const fullLink = buildFullLink(link);

          if (isAdLink(fullLink) || !isValidNaverBlogPost(fullLink)) return;

          const description = $el.find(DESC_SELECTORS).first().text().trim();
          const blogInfo = $el.find(BLOG_INFO_SELECTORS).first().text().trim();
          const date = $el.find('.date, .sub_time, .time').first().text().trim();
          const thumbEl = $el.find('img').first();
          const thumbnail = thumbEl.attr('src') || thumbEl.attr('data-src') || '';

          items.push({
            title: stripHtmlTags(title),
            link: fullLink,
            description: stripHtmlTags(description),
            blogName: blogInfo,
            date,
            thumbnail,
          });
        });

        break;
      }
    }

    if (!foundResults) {
      const generalLinks = $('a[href*="blog"], a[href*="post"]');

      generalLinks.each((_, element) => {
        const $el = $(element);
        const title = $el.text().trim();
        const link = $el.attr('href') || '';

        if (title.length <= 10 || !link) return;

        const fullLink = buildFullLink(link);

        if (isAdLink(fullLink) || !isValidNaverBlogPost(fullLink)) return;

        const parent = $el.closest('div, li, article, section');
        const description = parent
          .find('p, span, div')
          .not($el)
          .text()
          .trim()
          .slice(0, 200);

        items.push({
          title: stripHtmlTags(title),
          link: fullLink,
          description: stripHtmlTags(description),
        });
      });
    }

    const uniqueItems = items.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.link === item.link)
    );

    const deduplicatedItems: BlogCrawlItem[] = [];
    let lastBlogId = '';

    for (const item of uniqueItems) {
      const currentBlogId = getBlogIdFromLink(item.link);

      if (currentBlogId && currentBlogId === lastBlogId) {
        continue;
      }

      deduplicatedItems.push(item);
      lastBlogId = currentBlogId;
    }

    return {
      keyword,
      items: deduplicatedItems,
      total: deduplicatedItems.length,
      url: searchUrl,
    };
  } catch (error) {
    console.error('[ERROR] 네이버 블로그 크롤링 오류:', error);
    throw new Error(
      `블로그 크롤링 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
    );
  }
};

export const logBlogCrawlResults = (response: BlogCrawlResponse) => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`[BlogCrawl] 키워드: ${response.keyword}`);
  console.log(`[BlogCrawl] 총 ${response.total}개 결과 발견`);
  console.log(`[BlogCrawl] URL: ${response.url}`);
  console.log(`${'='.repeat(50)}`);
  response.items.slice(0, 10).forEach((item, idx) => {
    console.log(`  ${idx + 1}. ${item.title}`);
    console.log(`     └─ ${item.link}`);
  });
  if (response.items.length > 10) {
    console.log(`  ... 외 ${response.items.length - 10}개`);
  }
  console.log('');
};
