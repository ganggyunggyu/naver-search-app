import { extractPopularItems as parsePopularItems } from './parser';

export { parsePopularItems as extractPopularItems };

interface PopularSelectorConfig {
  container: string;
  item: string;
  titleLink: string;
  preview: string;
}
export const NAVER_POPULAR_SELECTOR_CONFIG: PopularSelectorConfig = {
  container: '.fds-ugc-single-intention-item-list',
  item: '.xYjt3uiECoJ0o6Pj0xOU',
  titleLink: '.CC5p8OBUeZzCymeWTg7v',
  preview: '.vhAXtgPpcvABjkgTaDZ0 .sds-comps-text-type-body1',
} as const;
