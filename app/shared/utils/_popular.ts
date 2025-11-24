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
  item: '.oIxNPKojSTvxvkjdwXVC',
  titleLink: '.yUgjyAT8hsQKswX75JB4',
  preview: '.q_Caq4prL1xTKuKsMjDN .sds-comps-text-type-body1',
} as const;
