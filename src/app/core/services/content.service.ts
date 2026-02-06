import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private http = inject(HttpClient);
  private apiUrl = 'https://graduation-project-git-master-ahmeds-projects-121d239c.vercel.app/api/content'; 
  // Note: Using full URL for now to ensure connectivity, or relative if proxy is set. 
  // Let's use relative '/api/content' assuming proxy or base URL config.
  // Actually, better to use environment variable, but for now relative path is safest if served from same origin.
  // Wait, in dev mode (ng serve), relative path needs proxy. Since we don't have proxy.conf set up in this view, 
  // I will use a reliable relative path or the production URL if dev is local.
  // Given user is deploying to Vercel, relative '/api/content' is best.

  values = signal<any[]>([]);
  stats = signal<any[]>([]);
  team = signal<any[]>([]);
  partners = signal<any[]>([]);

  constructor() {
    this.fetchContent();
  }

  fetchContent() {
    this.http.get<any[]>('/api/content').subscribe({
      next: (data) => {
        // Filter and sort by order
        this.values.set(data.filter(i => i.type === 'value').sort((a, b) => a.order - b.order));
        this.stats.set(data.filter(i => i.type === 'stat').sort((a, b) => a.order - b.order));
        this.team.set(data.filter(i => i.type === 'team').sort((a, b) => a.order - b.order));
        
        // Partners might be simplified in DB, but for now let's map if needed or just use logic
        // If partners are not in DB yet, keep default or fetch if seeded.
        // My seed didn't include partners, so I'll keep them static or seed them too.
        // Let's keep partners static for this specific task unless requested, as values/stats/team were the main focus.
        // Actually, user said he wins customers, so Social Proof (Stats/Values) is key. Structure is dynamic now.
      },
      error: (err) => console.error('Failed to fetch content', err)
    });
  }

  // Fallback data is not needed as we initialize empty and fetch. 
  // If we want fallback, we should seed it in the DB.
  // For now, I will remove the duplicate declaration and let it be populated by API or stay empty.
  // Or better, I can initialize the signal with default values if I want instant render before fetch.
  // But to be consistent with "Dynamic" goal, I will rely on API. 
  // I will just remove the bottom duplicate block.

}
