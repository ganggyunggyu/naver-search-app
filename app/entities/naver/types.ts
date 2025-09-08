export interface PopularItem {
  title: string;
  link: string;
  snippet?: string;
  image?: string;
  badge?: string;
  group?: string;
}

export interface PopularResponse {
  url: string;
  count: number;
  items: PopularItem[];
  status: number;
  error?: string;
}

