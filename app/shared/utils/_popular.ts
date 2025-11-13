import { PopularItem } from '@/entities/naver/_types';
import { extractPopularItems as parsePopularItems } from './parser';

// Re-export the function with the same name for compatibility
export { parsePopularItems as extractPopularItems };

// Keep the selector config for the naver-popular-update command
interface PopularSelectorConfig {
  container: string;
  item: string;
  titleLink: string;
  preview: string;
}

/**
 * AUTO-GENERATED: updated by /naver-popular-update command.
 */
export const NAVER_POPULAR_SELECTOR_CONFIG: PopularSelectorConfig = {
  container: '.fds-ugc-single-intention-item-list',
  item: '.xYjt3uiECoJ0o6Pj0xOU',
  titleLink: '.CC5p8OBUeZzCymeWTg7v',
  preview: '.vhAXtgPpcvABjkgTaDZ0 .sds-comps-text-type-body1',
} as const;