import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/content`;

  values = signal<any[]>([]);
  stats = signal<any[]>([]);
  team = signal<any[]>([]);
  partners = signal<any[]>([]);

  constructor() {
    this.fetchContent();
  }

  fetchContent() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        // Filter and sort by order
        this.values.set(data.filter((i: any) => i.type === 'value').sort((a: any, b: any) => a.order - b.order));
        this.stats.set(data.filter((i: any) => i.type === 'stat').sort((a: any, b: any) => a.order - b.order));
        this.team.set(data.filter((i: any) => i.type === 'team').sort((a: any, b: any) => a.order - b.order));
      },
      error: (err) => console.error('Failed to fetch content', err)
    });
  }
}
