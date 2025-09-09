import { fetchHtml, NAVER_DESKTOP_HEADERS } from './_http';
import { getIframeElement } from './_getIframeElement';
import { loadHtml } from './html';
import { normalizeImageSrc } from './_images';
import { cleanText, isMeaningfulText } from './_text';

export const resolveNaverBlogHtml = async (
  blogUrl: string
): Promise<{ html: string; actualUrl: string }> => {
  const mainHtml = await fetchHtml(blogUrl, NAVER_DESKTOP_HEADERS as any);
  const { url: iframeUrl } = getIframeElement(mainHtml, 'https://blog.naver.com');
  let actualUrl = blogUrl;
  let html = mainHtml;
  if (iframeUrl) {
    actualUrl = iframeUrl;
    try {
      html = await fetchHtml(actualUrl, { ...(NAVER_DESKTOP_HEADERS as any), Referer: blogUrl });
    } catch {}
  }
  return { html, actualUrl };
};

const contentSelectors = [
  { container: '.se-viewer', text: '.se-text-paragraph, .se-text, .se-component-content', images: '.se-image-resource, .se-image img, img' },
  { container: '.se-component', text: '.se-text-paragraph, .se-text, .se-component-content', images: '.se-image-resource, .se-image img, img' },
  { container: '[data-module="SE2M_TEXT"]', text: '.se-text-paragraph, .se-text, p, div', images: 'img' },
  { container: '.se-section', text: '.se-text-paragraph, .se-text, p', images: '.se-image img, img' },
  { container: '.blog-content', text: 'p, div, span', images: 'img' },
  { container: '.post-content', text: 'p, div', images: 'img' },
  { container: '.post-view', text: '.post_ct, .post-content, p, div', images: 'img' },
  { container: '#postViewArea', text: 'p, div', images: 'img' },
  { container: '.blogview_content', text: 'p, div', images: 'img' },
  { container: '.contents_style', text: 'p, div', images: 'img' },
  { container: '.content', text: 'p, div', images: 'img' },
  { container: 'article', text: 'p, div', images: 'img' },
  { container: 'main', text: 'p, div', images: 'img' },
];

export const extractContentFromHtml = (html: string) => {
  const $ = loadHtml(html);

  const title =
    $('.se-title-text').text() ||
    $('meta[property="og:title"]').attr('content') ||
    $('title').text() ||
    '제목 없음';

  // 블로그 이름(작성자/블로그 닉네임) 추출 시도
  const blogNameCandidates = [
    '.nick',
    '.nickname',
    '.nick_name',
    '.blog_name',
    '.blogger',
    '.profile_name',
    '.se-profile .nick',
    '.pcol1 .nick',
    '.blog_header .nick',
  ];
  let blogName = '';
  for (const sel of blogNameCandidates) {
    const txt = $(sel as any).first().text().trim();
    if (txt && txt.length >= 2) {
      blogName = txt;
      break;
    }
  }
  if (!blogName) {
    const ogSite = $('meta[property="og:site_name"]').attr('content') || '';
    if (ogSite && ogSite.length > 2 && !/네이버\s*블로그/.test(ogSite)) blogName = ogSite.trim();
  }

  let content = '';
  const images: string[] = [];
  const extractedTexts = new Set<string>();
  let foundContent = false;

  const seMainContainer = $('.se-main-container');
  if (seMainContainer.length > 0) {
    let mainText = seMainContainer.text().trim();
    if (mainText && mainText.length > 50) {
      content = cleanText(mainText);
      foundContent = true;
      seMainContainer.find('img').each((_, img) => {
        const $img = $(img as any);
        const raw = $img.attr('src') || $img.attr('data-lazy-src') || $img.attr('data-src') || $img.attr('data-original');
        const normalized = normalizeImageSrc(raw);
        if (normalized && !images.includes(normalized)) images.push(normalized);
      });
    }
  }

  if (!foundContent) {
    for (const selector of contentSelectors) {
      const containers = $(selector.container as any);
      if (containers.length > 0) {
        let currentSelectorFoundContent = false;
        containers.each((_, container) => {
          const $container = $(container as any);
          const textElements = $container.find(selector.text as any);
          textElements.each((_, textEl) => {
            const text = $(textEl as any).text().trim();
            if (isMeaningfulText(text)) {
              const textSignature = text.substring(0, 30);
              if (!extractedTexts.has(text) && !extractedTexts.has(textSignature)) {
                extractedTexts.add(text);
                extractedTexts.add(textSignature);
                content += cleanText(text) + '\n\n';
                foundContent = true;
                currentSelectorFoundContent = true;
              }
            }
          });

          const imgElements = $container.find(selector.images as any);
          imgElements.each((_, img) => {
            const $img = $(img as any);
            const src = $img.attr('src') || $img.attr('data-lazy-src') || $img.attr('data-src') || $img.attr('data-original');
            const normalized = normalizeImageSrc(src);
            if (normalized && !images.includes(normalized)) images.push(normalized);
          });
        });
        if (currentSelectorFoundContent) break;
      }
    }
  }

  if (!content.trim()) {
    const allTextElements = $('p, div, span, td');
    allTextElements.each((_, el) => {
      const $el = $(el as any);
      const text = $el.clone().children().remove().end().text().trim();
      if (isMeaningfulText(text, { min: 15 })) {
        if (!extractedTexts.has(text)) {
          extractedTexts.add(text);
          content += cleanText(text) + '\n\n';
        }
      }
    });

    if (images.length === 0) {
      const allImages = $('img');
      allImages.each((_, img) => {
        const $img = $(img as any);
        const src = $img.attr('src') || $img.attr('data-src') || $img.attr('data-lazy-src');
        const normalized = normalizeImageSrc(src);
        if (normalized && !images.includes(normalized)) images.push(normalized);
      });
    }
  }

  if (content.trim()) content = cleanText(content);

  return {
    title: title.trim(),
    content: content.trim(),
    images,
    blogName: blogName.trim(),
    debug: {
      htmlLength: html.length,
      titleFound: !!title,
      contentLength: content.length,
      imagesFound: images.length,
    },
  };
};
