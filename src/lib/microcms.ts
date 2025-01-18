import { createClient, type MicroCMSImage } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

export type Blog = {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: Tag[];
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
  publishedAt: string;
  revisedAt: string;
  author: Author;
};

export type Tag = {
  id: string;
  name: string;
};

export type Author = {
  name: string;
  bio: string;
  icon: MicroCMSImage;
}

export type BlogResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Blog[];
};

export type TagResponse = {
  totalCount: number;
  offset: number;
  limit: number;
  contents: Tag[];
};
