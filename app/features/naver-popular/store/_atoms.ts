import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type {
  PopularResponse,
  BlogCrawlResponse,
} from '@/entities/naver/_types';
import type { PopularViewerItem } from '../components/_PopularViewerModal';
import type { RecentSearch } from '../types';

export const popularQueryAtom = atom<string>('');
export const popularIsAutoUrlAtom = atom<boolean>(true);
export const popularUrlAtom = atom<string>('');
export const popularIsLoadingAtom = atom<boolean>(false);
export const popularErrorAtom = atom<string>('');
export const popularDataAtom = atom<PopularResponse | null>(null);

export const blogSearchDataAtom = atom<BlogCrawlResponse | null>(null);
export const blogSearchErrorAtom = atom<string>('');

export const viewerOpenAtom = atom<boolean>(false);
export const viewerLoadingAtom = atom<boolean>(false);
export const viewerItemAtom = atom<PopularViewerItem | null>(null);

export const RECENT_SEARCH_STORAGE_KEY = 'naver_recent_search_list_v3';
export const recentSearchListAtom = atomWithStorage<RecentSearch[]>(
  RECENT_SEARCH_STORAGE_KEY,
  [],
  undefined,
  { getOnInit: true }
);
