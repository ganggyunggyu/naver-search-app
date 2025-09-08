import { useAtom, useSetAtom } from 'jotai';
import {
  viewerOpenAtom,
  viewerLoadingAtom,
  viewerItemAtom,
} from '../store/atoms';
import { useCallback } from 'react';

export const useViewerActions = () => {
  const [viewerItem, setViewerItem] = useAtom(viewerItemAtom);
  const setOpen = useSetAtom(viewerOpenAtom);
  const setLoading = useSetAtom(viewerLoadingAtom);

  const openViewer = useCallback(
    async (link: string) => {
      setOpen(true);
      setLoading(true);
      try {
        const res = await fetch(`/api/content?url=${encodeURIComponent(link)}`);
        const json = await res.json();
        if (json.error) return; // 토스트는 상위에서 처리 가능
        setViewerItem((prev) =>
          prev
            ? {
                ...prev,
                title: json.title || prev.title,
                content: json.content || '',
                blogName: json.blogName || undefined,
                image: (json.images && json.images[0]) || prev?.image,
                link,
              }
            : prev
        );
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setOpen, setViewerItem]
  );

  return { openViewer };
};

