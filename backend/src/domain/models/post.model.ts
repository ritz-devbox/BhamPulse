export interface Post {
  id?: string; // internal DB id
  redditId: string;
  title: string;
  author: string;
  content: string | null;
  flair: string | null;
  createdUtc: number;
  media: string | null;
  category: string | null;
  url: string;
}
