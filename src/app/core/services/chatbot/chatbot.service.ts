import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { OfflineAiService } from '../offline-ai.service';
import { environment } from '../../../../environments/environment';

import { ChatResponse, ChatProperty } from '../../models/chatbot.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private offlineAi = inject(OfflineAiService);
  
  // API URL - Connected to Real Backend
  private readonly API_URL = `${environment.apiUrl}/ai`; // Real Backend Connection
  
  // Session ID فريد لكل جلسة
  readonly sessionId = 'session_' + Date.now();
  
  // إشارة (Signal) لمعرفة هل الشات مفتوح أم لا
  isOpen = signal(false);
  
  // الفلاتر الحالية
  currentFilters = signal<Record<string, any>>({});
  
  // حالة الاتصال
  isConnected = signal(false);
  
  // العقار المختار لعرضه في صفحة التفاصيل
  selectedChatProperty = signal<ChatProperty | null>(null);

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
  setSelectedChatProperty(property: ChatProperty) {
    this.selectedChatProperty.set(property);
  }

  // مسح العقار المختار
  clearSelectedChatProperty() {
    this.selectedChatProperty.set(null);
  }

  // فحص الاتصال بالـ API
  async checkConnection(): Promise<boolean> {
    try {
      if (!this.API_URL) return false;
      // Fetch uses only base URL part if needed, or we just trust it for now.
      // Simplification: Check root API which we know exists
      const response = await fetch(`${environment.apiUrl}/`);
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
    try {
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

    } catch (error) {
      console.warn('Backend API failed, switching to Offline AI...');
      
      // Fallback to Offline AI
      const analysis = this.offlineAi.analyze(message);
      
      if (analysis.confidence > 0.3) {
        // Apply detected filters locally
        this.currentFilters.update(filters => ({
          ...filters,
          ...analysis.filters
        }));

        // Construct a response mimicking the backend
        let replyMessage = 'يبدو أن هناك مشكلة في الاتصال بالخادم، لكنني قمت بتحليل طلبك محلياً.\n';
        
        replyMessage += 'فهمت أنك تبحث عن: ';
        const details = [];
        if (analysis.filters.type) details.push(`عقار نوع ${analysis.filters.type}`);
        if (analysis.filters.beds) details.push(`${analysis.filters.beds} غرف`);
        if (analysis.filters.priceTo) details.push(`سعر أقل من ${analysis.filters.priceTo}`);
        
        replyMessage += details.join('، ') || 'عقار بمواصفات خاصة';
        replyMessage += '.\nيمكنك تصفح النتائج المحدثة في الصفحة.';

        return {
          message: replyMessage,
          filters: analysis.filters,
          // We can't return specific properties easily without searching the whole list here, 
          // but the filters are applied to global state usually via the component consuming this service.
          // Wait, ChatbotService updates `currentFilters` signal, but does it update GlobalState?
          // The SearchListComponent uses GlobalState. The ChatbotComponent likely observes ChatbotService.
        };
      } else {
        return {
          message: 'عذراً، لا أستطيع الاتصال بالخادم حالياً ولم أتمكن من فهم طلبك بدقة محلياً. يرجى المحاولة بصياغة أخرى أو استخدام فلاتر البحث اليدوية.',
          filters: {}
        };
      }
    }
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