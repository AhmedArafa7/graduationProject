import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// واجهة الرد من API
export interface ChatResponse {
  message?: string;
  question?: string;
  filters?: Record<string, any>;
  properties?: Property[];
  type?: string;
}

export interface Property {
  id?: number;
  type?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  size_sqm?: number;
  price?: number;
  location?: string;
  area?: string;
  floor?: string;
  payment_option?: string;
  furnished?: string;
  displayImage?: string; // الصورة المعروضة في الشات
}

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  
  // API URL
  private readonly API_URL = 'http://localhost:8000';
  
  // Session ID فريد لكل جلسة
  readonly sessionId = 'session_' + Date.now();
  
  // إشارة (Signal) لمعرفة هل الشات مفتوح أم لا
  isOpen = signal(false);
  
  // الفلاتر الحالية
  currentFilters = signal<Record<string, any>>({});
  
  // حالة الاتصال
  isConnected = signal(false);
  
  // العقار المختار لعرضه في صفحة التفاصيل
  selectedProperty = signal<Property | null>(null);

  toggle() {
    this.isOpen.update(v => !v);
  }

  open() {
    this.isOpen.set(true);
  }

  close() {
    this.isOpen.set(false);
  }

  // تعيين العقار المختار
  setSelectedProperty(property: Property) {
    this.selectedProperty.set(property);
  }

  // مسح العقار المختار
  clearSelectedProperty() {
    this.selectedProperty.set(null);
  }

  // فحص الاتصال بالـ API
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.API_URL + '/');
      if (response.ok) {
        this.isConnected.set(true);
        return true;
      }
      this.isConnected.set(false);
      return false;
    } catch (e) {
      this.isConnected.set(false);
      return false;
    }
  }

  // إرسال رسالة للـ API
  async sendMessage(message: string): Promise<ChatResponse> {
    const response = await firstValueFrom(
      this.http.post<ChatResponse>(`${this.API_URL}/chat`, {
        session_id: this.sessionId,
        message: message
      })
    );
    
    // تحديث الفلاتر إذا وجدت
    if (response.filters) {
      this.currentFilters.update(filters => ({
        ...filters,
        ...response.filters
      }));
    }
    
    return response;
  }

  // مسح الجلسة
  async clearSession(): Promise<void> {
    try {
      await firstValueFrom(
        this.http.delete(`${this.API_URL}/session/${this.sessionId}`)
      );
    } catch (e) {
      // تجاهل الخطأ إذا فشل المسح
    }
    this.currentFilters.set({});
  }
}