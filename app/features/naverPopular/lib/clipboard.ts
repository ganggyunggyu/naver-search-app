import type { PopularItem } from '@/shared/types/naver';

export const copyPreviewToClipboard = async (
  item: PopularItem,
  show: (message: string, opts?: { type?: 'success' | 'error' | 'info' }) => void
) => {
  const cleanTitle = item.title.replace(/\s+/g, ' ').trim();
  const cleanSnippet = item.snippet
    ? item.snippet.replace(/\s+/g, ' ').replace(/\n+/g, ' ').trim()
    : '';
  const plain = [cleanTitle, cleanSnippet, item.link].filter(Boolean).join('\n\n');
  try {
    await navigator.clipboard.writeText(plain);
    show('미리보기가 복사되었습니다!', { type: 'success' });
  } catch {
    show('복사 실패', { type: 'error' });
  }
};

export const copyFullContentToClipboard = async (
  link: string,
  show: (message: string, opts?: { type?: 'success' | 'error' | 'info' }) => void
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
            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
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
          try { document.body.removeChild(iframe); } catch {}
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

    const cleanTitle = json.title ? String(json.title).replace(/[ \t\f\v\u00A0]+/g, ' ').trim() : '';
    let finalContent = json.content || '';
    if (directContent && directContent.trim().length > finalContent.length) finalContent = directContent;
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

