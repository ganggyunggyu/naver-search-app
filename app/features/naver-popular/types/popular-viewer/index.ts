import type { PopularItem } from '@/entities/naver/types';

export interface PopularViewerItem extends PopularItem {
  content?: string;
  blogName?: string;
  actualUrl?: string;
}
