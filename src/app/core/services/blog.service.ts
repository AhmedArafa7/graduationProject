import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/posts`;
  
  // State for posts
  private postsSignal = signal<BlogPost[]>([]);
  public posts = computed(() => this.postsSignal());

  constructor() {
    this.loadPosts();
  }

  loadPosts() {
    this.http.get<BlogPost[]>(this.apiUrl).subscribe({
      next: (data: BlogPost[]) => this.postsSignal.set(data),
      error: (err: any) => console.error('Failed to load blog posts', err)
    });
  }

  // تصنيفات المدونة (يمكن جلبها من الباك اند لاحقاً أو استنتاجها)
  private categories = [
    { name: 'نصائح للبائعين', count: 12 },
    { name: 'أخبار السوق', count: 8 },
    { name: 'تصميم وديكور', count: 5 },
    { name: 'تكنولوجيا العقارات', count: 3 }
  ];

  getCategories() {
    return this.categories;
  }
  
  getAllPosts() {
    return this.postsSignal();
  }

  getPostById(id: number | string): BlogPost | undefined {
    return this.postsSignal().find(p => p.id === id || p.id === Number(id));
  }
  
  // Fetch single post from API if not found (optional enhancement)
  getPost(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`);
  }

  getRelatedPosts(currentId: number | string) {
    return this.postsSignal().filter(p => p.id != currentId).slice(0, 3);
  }
}