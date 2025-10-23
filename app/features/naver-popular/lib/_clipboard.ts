import type { PopularItem } from '@/entities/naver/_types';
import JSZip from 'jszip';

export const copyPreviewToClipboard = async (
  item: PopularItem,
  show: (
    message: string,
    opts?: { type?: 'success' | 'error' | 'info' }
  ) => void
) => {
  const cleanTitle = item.title.replace(/\s+/g, ' ').trim();
  const cleanSnippet = item.snippet
    ? item.snippet.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim()
    : '';
  const plain = [cleanTitle, cleanSnippet, item.link]
    .filter(Boolean)
    .join('\n\n');
  try {
    await navigator.clipboard.writeText(plain);
    show('미리보기가 복사되었습니다!', { type: 'success' });
  } catch {
    show('복사 실패', { type: 'error' });
  }
};

export const copyTitleToClipboard = async (
  title: string,
  show: (
    message: string,
    opts?: { type?: 'success' | 'error' | 'info' }
  ) => void
) => {
  try {
    const cleanTitle = title.replace(/\s+/g, ' ').trim();
    await navigator.clipboard.writeText(cleanTitle);
    show('제목이 복사되었습니다!', { type: 'success' });
  } catch {
    show('제목 복사 실패', { type: 'error' });
  }
};

export const copyFullContentToClipboard = async (
  link: string,
  show: (
    message: string,
    opts?: { type?: 'success' | 'error' | 'info' }
  ) => void
) => {
  try {
    let directContent = '';
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = link;
      document.body.appendChild(iframe);
      await new Promise<void>((resolve) => {
        iframe.onload = () => {
          try {
            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const all = iframeDoc.querySelectorAll('*');
              all.forEach((el: any) => {
                el.style.userSelect = 'auto';
                el.removeAttribute('onselectstart');
                el.removeAttribute('ondragstart');
                el.removeAttribute('oncontextmenu');
              });
              const main = iframeDoc.querySelector('.se-main-container');
              if (main) directContent = main.textContent || '';
            }
          } catch {}
          document.body.removeChild(iframe);
          resolve();
        };
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {}
          resolve();
        }, 5000);
      });
    } catch {}

    const res = await fetch(`/api/content?url=${encodeURIComponent(link)}`);
    const json = await res.json();
    if (json.error) {
      show(String(json.error), { type: 'error' });
      return;
    }

    const cleanTitle = json.title
      ? String(json.title)
          .replace(/[ \t\f\v\u00A0]+/g, ' ')
          .trim()
      : '';
    let finalContent = json.content || '';
    if (directContent && directContent.trim().length > finalContent.length)
      finalContent = directContent;
    const cleanContent = finalContent
      ? String(finalContent)
          .replace(/\r\n?/g, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;|&#39;/g, "'")
          .replace(/[ \t\f\v\u00A0]+/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .split('\n')
          .map((l) => l.replace(/[ \t\f\v\u00A0]+$/g, ''))
          .join('\n')
          .trim()
      : '';

    const full = [cleanTitle, cleanContent].filter(Boolean).join('\n\n');
    await navigator.clipboard.writeText(full);
    show('전체 본문이 복사되었습니다!', { type: 'success' });
  } catch {
    show('전체 본문 복사 실패', { type: 'error' });
  }
};

export const downloadContentToFile = async (
  link: string,
  title: string,
  show: (
    message: string,
    opts?: { type?: 'success' | 'error' | 'info' }
  ) => void
) => {
  try {
    let directContent = '';
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = link;
      document.body.appendChild(iframe);
      await new Promise<void>((resolve) => {
        iframe.onload = () => {
          try {
            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow?.document;
            if (iframeDoc) {
              const all = iframeDoc.querySelectorAll('*');
              all.forEach((el: any) => {
                el.style.userSelect = 'auto';
                el.removeAttribute('onselectstart');
                el.removeAttribute('ondragstart');
                el.removeAttribute('oncontextmenu');
              });
              const main = iframeDoc.querySelector('.se-main-container');
              if (main) directContent = main.textContent || '';
            }
          } catch {}
          document.body.removeChild(iframe);
          resolve();
        };
        setTimeout(() => {
          try {
            document.body.removeChild(iframe);
          } catch {}
          resolve();
        }, 5000);
      });
    } catch {}

    const res = await fetch(`/api/content?url=${encodeURIComponent(link)}`);
    const json = await res.json();
    if (json.error) {
      show(String(json.error), { type: 'error' });
      return;
    }

    const cleanTitle = json.title
      ? String(json.title)
          .replace(/[ \t\f\v\u00A0]+/g, ' ')
          .trim()
      : title;
    let finalContent = json.content || '';
    if (directContent && directContent.trim().length > finalContent.length)
      finalContent = directContent;
    const cleanContent = finalContent
      ? String(finalContent)
          .replace(/\r\n?/g, '\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;|&#39;/g, "'")
          .replace(/[ \t\f\v\u00A0]+/g, ' ')
          .replace(/\n{3,}/g, '\n\n')
          .split('\n')
          .map((l) => l.replace(/[ \t\f\v\u00A0]+$/g, ''))
          .join('\n')
          .trim()
      : '';

    const full = [cleanTitle, cleanContent].filter(Boolean).join('\n\n');

    const safeFileName = cleanTitle
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 100);

    const blob = new Blob([full], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeFileName || 'content'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    show('파일이 다운로드되었습니다!', { type: 'success' });
  } catch {
    show('파일 다운로드 실패', { type: 'error' });
  }
};

export const downloadAllContentToZip = async (
  itemList: PopularItem[],
  show: (
    message: string,
    opts?: { type?: 'success' | 'error' | 'info' }
  ) => void
) => {
  try {
    const zip = new JSZip();
    let successCount = 0;

    show('ZIP 파일 생성 중...', { type: 'info' });

    for (let i = 0; i < itemList.length; i++) {
      const item = itemList[i];
      try {
        let directContent = '';
        try {
          const iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          iframe.src = item.link;
          document.body.appendChild(iframe);
          await new Promise<void>((resolve) => {
            iframe.onload = () => {
              try {
                const iframeDoc =
                  iframe.contentDocument || iframe.contentWindow?.document;
                if (iframeDoc) {
                  const all = iframeDoc.querySelectorAll('*');
                  all.forEach((el: any) => {
                    el.style.userSelect = 'auto';
                    el.removeAttribute('onselectstart');
                    el.removeAttribute('ondragstart');
                    el.removeAttribute('oncontextmenu');
                  });
                  const main = iframeDoc.querySelector('.se-main-container');
                  if (main) directContent = main.textContent || '';
                }
              } catch {}
              document.body.removeChild(iframe);
              resolve();
            };
            setTimeout(() => {
              try {
                document.body.removeChild(iframe);
              } catch {}
              resolve();
            }, 3000);
          });
        } catch {}

        const res = await fetch(`/api/content?url=${encodeURIComponent(item.link)}`);
        const json = await res.json();

        if (!json.error) {
          const cleanTitle = json.title
            ? String(json.title)
                .replace(/[ \t\f\v\u00A0]+/g, ' ')
                .trim()
            : item.title;
          let finalContent = json.content || '';
          if (directContent && directContent.trim().length > finalContent.length)
            finalContent = directContent;
          const cleanContent = finalContent
            ? String(finalContent)
                .replace(/\r\n?/g, '\n')
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#x27;|&#39;/g, "'")
                .replace(/[ \t\f\v\u00A0]+/g, ' ')
                .replace(/\n{3,}/g, '\n\n')
                .split('\n')
                .map((l) => l.replace(/[ \t\f\v\u00A0]+$/g, ''))
                .join('\n')
                .trim()
            : '';

          if (cleanContent) {
            const full = [cleanTitle, cleanContent].filter(Boolean).join('\n\n');
            const safeFileName = cleanTitle
              .replace(/[<>:"/\\|?*]/g, '')
              .replace(/\s+/g, '_')
              .substring(0, 80);

            zip.file(`${safeFileName || `인기글_${i + 1}`}.txt`, full);
            successCount++;
          }
        }

        if ((i + 1) % 3 === 0 || i === itemList.length - 1) {
          show(`${i + 1}/${itemList.length} 처리 중... (성공: ${successCount})`, { type: 'info' });
        }

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch {
        // 개별 아이템 실패는 건너뛰기
      }
    }

    if (successCount === 0) {
      show('다운로드할 콘텐츠가 없습니다', { type: 'error' });
      return;
    }

    show('ZIP 파일 압축 중...', { type: 'info' });
    const zipBlob = await zip.generateAsync({ type: 'blob' });

    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `네이버_인기글_${successCount}개_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    show(`ZIP 다운로드 완료! (${successCount}개 파일)`, { type: 'success' });
  } catch {
    show('ZIP 다운로드 실패', { type: 'error' });
  }
};

// 네이버 블로그 링크 변환 유틸리티
export const convertToMobileLink = (link: string): string => {
  // 네이버 블로그 데스크탑 → 모바일 변환
  if (link.includes('blog.naver.com') && !link.includes('m.blog.naver.com')) {
    return link.replace('://blog.naver.com', '://m.blog.naver.com');
  }

  return link; // 네이버 블로그가 아니거나 이미 모바일인 경우 원본 반환
};

export const convertToDesktopLink = (link: string): string => {
  // 네이버 블로그 모바일 → 데스크탑 변환
  if (link.includes('m.blog.naver.com')) {
    return link.replace('://m.blog.naver.com', '://blog.naver.com');
  }

  return link; // 네이버 블로그가 아니거나 이미 데스크탑인 경우 원본 반환
};

// 모바일 링크 복사
export const copyMobileLinkToClipboard = async (
  link: string,
  show: (
    message: string,
    opts?: { type?: 'success' | 'error' | 'info' }
  ) => void
) => {
  try {
    const mobileLink = convertToMobileLink(link);
    await navigator.clipboard.writeText(mobileLink);
    show('모바일 링크가 복사되었습니다!', { type: 'success' });
  } catch {
    show('모바일 링크 복사 실패', { type: 'error' });
  }
};

// 데스크탑 링크 복사
export const copyDesktopLinkToClipboard = async (
  link: string,
  show: (
    message: string,
    opts?: { type?: 'success' | 'error' | 'info' }
  ) => void
) => {
  try {
    const desktopLink = convertToDesktopLink(link);
    await navigator.clipboard.writeText(desktopLink);
    show('데스크탑 링크가 복사되었습니다!', { type: 'success' });
  } catch {
    show('데스크탑 링크 복사 실패', { type: 'error' });
  }
};

// 수정 링크 변환 (블로그 링크 → 수정 링크)
export const convertToEditLink = (link: string): string => {
  // 네이버 블로그 링크 패턴: blog.naver.com/{blogId}/{logNo} 또는 m.blog.naver.com/{blogId}/{logNo}
  const match = link.match(/(?:m\.)?blog\.naver\.com\/([^/?]+)\/(\d+)/);

  if (match) {
    const [, blogId, logNo] = match;
    // 수정 링크는 항상 데스크톱 버전으로
    return `https://blog.naver.com/${blogId}?Redirect=Update&logNo=${logNo}`;
  }

  return link;
};

// 수정 링크 복사
export const copyEditLinkToClipboard = async (
  link: string,
  show: (
    message: string,
    opts?: { type?: 'success' | 'error' | 'info' }
  ) => void
) => {
  try {
    const editLink = convertToEditLink(link);
    await navigator.clipboard.writeText(editLink);
    show('수정 링크가 복사되었습니다!', { type: 'success' });
  } catch {
    show('수정 링크 복사 실패', { type: 'error' });
  }
};

// 하위 호환성을 위한 별칭
export const downloadAllContentToFile = downloadAllContentToZip;
