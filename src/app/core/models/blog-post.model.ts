export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content?: string; // HTML content
  image: string;
  author: string;
  authorImage: string;
  authorTitle: string;
  date: string;
  readTime: string;
  category: string;
  views: string;
}
