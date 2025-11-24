import {
  extractPopularItems as parsePopularItems,
  fetchAndParsePopular,
  searchPopularItems,
} from './parser';

export { parsePopularItems as extractPopularItems };
export { fetchAndParsePopular, searchPopularItems };

interface PopularSelectorConfig {
  container: string;
  item: string;
  titleLink: string;
  preview: string;
}
export const NAVER_POPULAR_SELECTOR_CONFIG: PopularSelectorConfig = {
  container: '.fds-ugc-single-intention-item-list',
  item: '.oIxNPKojSTvxvkjdwXVC',
  titleLink: '.yUgjyAT8hsQKswX75JB4',
  preview: '.q_Caq4prL1xTKuKsMjDN .sds-comps-text-type-body1',
} as const;
