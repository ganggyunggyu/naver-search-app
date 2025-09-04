import type { Route } from './+types/api.content';
import * as cheerio from 'cheerio';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const blogUrl = url.searchParams.get('url');

  if (!blogUrl) {
    return Response.json(
      {
        error: '블로그 URL이 필요합니다.',
        status: 400,
      },
      { status: 400 }
    );
  }

  if (!blogUrl.includes('blog.naver.com')) {
    return Response.json(
      {
        error: '네이버 블로그 URL만 지원됩니다.',
        status: 400,
      },
      { status: 400 }
    );
  }

  try {
    const mainResponse = await fetch(blogUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!mainResponse.ok) {
      throw new Error(`HTTP ${mainResponse.status}`);
    }

    const mainHtml = await mainResponse.text();
    const $main = cheerio.load(mainHtml);

    const iframeSrc =
      $main('#mainFrame').attr('src') || $main('iframe').attr('src');

    let actualUrl = blogUrl;
    let html = mainHtml;

    if (iframeSrc) {
      if (iframeSrc.startsWith('/')) {
        actualUrl = 'https://blog.naver.com' + iframeSrc;
      } else if (iframeSrc.startsWith('http')) {
        actualUrl = iframeSrc;
      }

      const iframeResponse = await fetch(actualUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          Connection: 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          Referer: blogUrl,
        },
      });

      if (iframeResponse.ok) {
        html = await iframeResponse.text();
      }
    }

    const $ = cheerio.load(html);

    // 드래그 방지 속성들 제거
    $('*').each((_, element) => {
      const $element = $(element);
      // 드래그 방지 스타일 제거
      $element.removeAttr('onselectstart');
      $element.removeAttr('ondragstart');
      $element.removeAttr('oncontextmenu');
      $element.removeAttr('unselectable');
      $element.css('user-select', 'auto');
      $element.css('-webkit-user-select', 'auto');
      $element.css('-moz-user-select', 'auto');
      $element.css('-ms-user-select', 'auto');
    });

    // 드래그 방지 스크립트 태그들 제거
    $('script').each((_, script) => {
      const scriptText = $(script).html() || '';
      if (
        scriptText.includes('selectstart') ||
        scriptText.includes('dragstart') ||
        scriptText.includes('contextmenu') ||
        scriptText.includes('user-select') ||
        scriptText.includes('copy') ||
        scriptText.includes('selection')
      ) {
        $(script).remove();
      }
    });

    let content = '';
    let title = '';
    let images: string[] = [];
    let foundContent = false;
    const extractedTexts = new Set<string>();

    title =
      $('.se-title-text').text() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text() ||
      '제목 없음';

    const seMainContainer = $('.se-main-container');

    if (seMainContainer.length > 0) {
      // se-main-container에서 간단하게 텍스트 추출 (드래그 방지만 해제된 상태)
      let mainText = seMainContainer.text().trim();

      if (mainText && mainText.length > 50) {
        // 기본적인 정리만 수행
        content = mainText
          .replace(/\s+/g, ' ')
          .replace(/Previous image/g, '')
          .replace(/Next image/g, '')
          .trim();
        foundContent = true;

        seMainContainer.find('img').each((_, img) => {
          const $img = $(img);
          let src =
            $img.attr('src') ||
            $img.attr('data-lazy-src') ||
            $img.attr('data-src') ||
            $img.attr('data-original');

          if (
            src &&
            !src.includes('icon') &&
            !src.includes('emoticon') &&
            !src.includes('profile')
          ) {
            if (src.startsWith('//')) {
              src = 'https:' + src;
            } else if (src.startsWith('/')) {
              src = 'https://blog.naver.com' + src;
            }

            if (src.includes('postfiles.pstatic.net')) {
              src = src.replace(/\?type=w\d+/, '?type=w2000');
            }

            if (src.startsWith('http') && !images.includes(src)) {
              images.push(src);
            }
          }
        });
      }
    }

    const contentSelectors = [
      {
        container: '.se-viewer',
        text: '.se-text-paragraph, .se-text, .se-component-content',
        images: '.se-image-resource, .se-image img, img',
      },
      {
        container: '.se-component',
        text: '.se-text-paragraph, .se-text, .se-component-content',
        images: '.se-image-resource, .se-image img, img',
      },
      {
        container: '[data-module="SE2M_TEXT"]',
        text: '.se-text-paragraph, .se-text, p, div',
        images: 'img',
      },
      {
        container: '.se-section',
        text: '.se-text-paragraph, .se-text, p',
        images: '.se-image img, img',
      },

      { container: '.blog-content', text: 'p, div, span', images: 'img' },
      { container: '.post-content', text: 'p, div', images: 'img' },

      {
        container: '.post-view',
        text: '.post_ct, .post-content, p, div',
        images: 'img',
      },
      { container: '#postViewArea', text: 'p, div', images: 'img' },
      { container: '.blogview_content', text: 'p, div', images: 'img' },
      { container: '.contents_style', text: 'p, div', images: 'img' },

      { container: '.content', text: 'p, div', images: 'img' },
      { container: 'article', text: 'p, div', images: 'img' },
      { container: 'main', text: 'p, div', images: 'img' },
    ];

    if (!foundContent) {
      for (const selector of contentSelectors) {
        const containers = $(selector.container);
        if (containers.length > 0) {
          let currentSelectorFoundContent = false;

          containers.each((_, container) => {
            const $container = $(container);

            const textElements = $container.find(selector.text);
            textElements.each((_, textEl) => {
              let text = $(textEl).text().trim();

              if (
                text &&
                text.length > 10 &&
                !text.includes('Previous image') &&
                !text.includes('Next image') &&
                !text.includes('댓글') &&
                !text.includes('공유') &&
                !text.includes('구독') &&
                !text.includes('좋아요') &&
                !text.includes('이전') &&
                !text.includes('다음') &&
                !text.match(/^\d+\.\s*$/) &&
                !text.match(/^[^\w\s가-힣]+$/)
              ) {
                const textSignature = text.substring(0, 30);
                if (
                  !extractedTexts.has(text) &&
                  !extractedTexts.has(textSignature)
                ) {
                  extractedTexts.add(text);
                  extractedTexts.add(textSignature);
                  content += text + '\n\n';
                  foundContent = true;
                  currentSelectorFoundContent = true;
                }
              }
            });

            const imgElements = $container.find(selector.images);
            imgElements.each((_, img) => {
              const $img = $(img);
              let src =
                $img.attr('src') ||
                $img.attr('data-lazy-src') ||
                $img.attr('data-src') ||
                $img.attr('data-original');

              if (
                src &&
                !src.includes('icon') &&
                !src.includes('emoticon') &&
                !src.includes('profile')
              ) {
                if (src.startsWith('//')) {
                  src = 'https:' + src;
                } else if (src.startsWith('/')) {
                  src = 'https://blog.naver.com' + src;
                }

                if (src.includes('postfiles.pstatic.net')) {
                  src = src.replace(/\?type=w\d+/, '?type=w2000');
                }

                if (src.startsWith('http') && !images.includes(src)) {
                  images.push(src);
                }
              }
            });
          });

          if (currentSelectorFoundContent) {
            break;
          }
        }
      }
    }

    if (!content.trim()) {
      const allTextElements = $('p, div, span, td');

      allTextElements.each((_, el) => {
        const $el = $(el);
        const text = $el.clone().children().remove().end().text().trim();
        if (
          text &&
          text.length > 15 &&
          !text.includes('댓글') &&
          !text.includes('공유') &&
          !text.includes('구독') &&
          !text.includes('네이버') &&
          !text.includes('블로그') &&
          !text.includes('이전') &&
          !text.includes('다음') &&
          !text.includes('Previous image') &&
          !text.includes('Next image') &&
          !text.includes('좋아요') &&
          !extractedTexts.has(text)
        ) {
          extractedTexts.add(text);
          content += text + '\n\n';
        }
      });

      if (images.length === 0) {
        const allImages = $('img');
        allImages.each((_, img) => {
          const $img = $(img);
          let src =
            $img.attr('src') ||
            $img.attr('data-src') ||
            $img.attr('data-lazy-src');
          if (
            src &&
            src.startsWith('http') &&
            !src.includes('icon') &&
            !src.includes('profile')
          ) {
            if (!images.includes(src)) {
              images.push(src);
            }
          }
        });
      }
    }

    // 간단한 정리만 수행 (중복 제거 로직 최소화)
    if (content.trim()) {
      content = content
        .replace(/Previous image/g, '')
        .replace(/Next image/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (!content.trim() || content.length < 50) {
      return Response.json({
        title: title.trim(),
        content:
          '본문을 추출할 수 없습니다. 해당 블로그의 구조가 지원되지 않을 수 있습니다.',
        images: images,
        url: blogUrl,
        status: 200,
        debug: {
          htmlLength: html.length,
          titleFound: !!title,
          contentLength: content.length,
          imagesFound: images.length,
        },
      });
    }

    return Response.json({
      title: title.trim(),
      content: content.trim(),
      images: images,
      url: blogUrl,
      status: 200,
    });
  } catch (error) {
    console.error('Content fetch error:', error);
    return Response.json(
      {
        error: `본문을 가져오는데 실패했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        status: 500,
      },
      { status: 500 }
    );
  }
}
