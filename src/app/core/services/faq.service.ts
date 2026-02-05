import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class FaqService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/faqs`;
  
  private faqsSignal = signal<Faq[]>([]);
  
  get faqs() {
    return this.faqsSignal.asReadonly();
  }

  constructor() {
    this.loadFaqs();
  }

  loadFaqs() {
    this.http.get<Faq[]>(this.apiUrl).subscribe({
      next: (data: Faq[]) => this.faqsSignal.set(data),
      error: (err: any) => console.error('Failed to load FAQs', err)
    });
  }

  getCategories() {
    // Ideally fetch from backend or derive from data
    return [
      'الكل',
      'عامة',
      'للمشترين',
      'للوكلاء',
      'المدفوعات',
      'تقنية'
    ];
  }
}
