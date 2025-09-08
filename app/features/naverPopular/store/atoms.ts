import { atom } from 'jotai';
import type { PopularItem, PopularResponse } from '@/entities/naver/types';
import type { PopularViewerItem } from '@/components/naverPopular/PopularViewerModal';

export const popularQueryAtom = atom<string>('');
export const popularIsAutoUrlAtom = atom<boolean>(true);
export const popularUrlAtom = atom<string>('');
export const popularIsLoadingAtom = atom<boolean>(false);
export const popularErrorAtom = atom<string>('');
export const popularDataAtom = atom<PopularResponse | null>(null);

export const viewerOpenAtom = atom<boolean>(false);
export const viewerLoadingAtom = atom<boolean>(false);
export const viewerItemAtom = atom<PopularViewerItem | null>(null);
