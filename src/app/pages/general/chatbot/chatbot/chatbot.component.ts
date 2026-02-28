import { Component, signal, ViewChild, ElementRef, afterNextRender, inject, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotService } from '../../../../core/services/chatbot/chatbot.service';
import { ChatResponse, ChatProperty, ChatMessage } from '../../../../core/models/chatbot.model';
import { UserService } from '../../../../core/services/user.service';
import { AudioRecorderService } from '../../../../core/services/chatbot/audio-recorder.service';

@Component({
  selector: 'app-chatbot',
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.scss'
})
export class ChatbotComponent {
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  // يجب أن تكون public لتُستخدم في الـ HTML
  public chatbotService = inject(ChatbotService);
  public audioService = inject(AudioRecorderService);
  private router = inject(Router);
  private userService = inject(UserService);

  // صورة المستخدم
  userAvatar = computed(() => this.userService.getProfileImage());

  isTyping = signal(false);
  inputText = signal('');
  apiError = signal<string | null>(null);

  messages = signal<ChatMessage[]>([
    {
      id: 1,
      text: 'مرحباً بك في Baytology! 👋 أنا مساعدك الذكي. كيف يمكنني مساعدتك اليوم في رحلتك العقارية؟',
      sender: 'bot',
      type: 'text',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  quickReplies = [
    'أبحث عن شقة للإيجار',
    'أريد بيع عقاري',
    'ما هو متوسط الأسعار؟',
    'تواصل مع وكيل'
  ];

  constructor() {
    effect(() => {
      const text = this.audioService.transcribedText();
      if (text) {
        untracked(() => {
          const current = this.inputText();
          this.inputText.set(current ? current + ' ' + text : text);
        });
      }
    });

    afterNextRender(() => {
      this.scrollToBottom();
      // فحص الاتصال عند البداية
      this.chatbotService.checkConnection();
    });
  }

  toggleChat() {
    this.chatbotService.toggle();
  }

  toggleRecording() {
    if (this.audioService.isRecording()) {
      this.audioService.stopRecording();
    } else {
      this.audioService.startRecording();
    }
  }

  async sendMessage(text: string = this.inputText()) {
    if (!text.trim()) return;

    this.addMessage(text, 'user');
    this.inputText.set('');
    this.isTyping.set(true);
    this.apiError.set(null);

    try {
      const response = await this.chatbotService.sendMessage(text);
      this.isTyping.set(false);
      this.handleApiResponse(response);
    } catch (e: any) {
      this.isTyping.set(false);
      const errorMessage = e?.error?.detail || e?.message || 'حدث خطأ في الاتصال';
      this.apiError.set(errorMessage);
      this.addMessage('❌ ' + errorMessage, 'bot');
    }
  }

  private addMessage(text: string, sender: 'user' | 'bot', type: 'text' | 'property' | 'question' = 'text', data?: any) {
    this.messages.update(msgs => [...msgs, {
      id: Date.now(),
      text,
      sender,
      type,
      data,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    this.scrollToBottom();
  }

  private handleApiResponse(response: ChatResponse) {
    // إضافة رسالة البوت
    if (response.message) {
      this.addMessage(response.message, 'bot');
    }

    // إضافة السؤال إذا وجد
    if (response.question) {
      this.addMessage(response.question, 'bot', 'question');
    }

    // عرض العقارات
    if (response.properties && response.properties.length > 0) {
      // إضافة ملخص في الرسائل
      const propertySummary = response.properties.slice(0, 3).map((p: ChatProperty) =>
        `🏠 ${p.type || 'عقار'} في ${p.city || '?'} - ${(p.price || 0).toLocaleString()} جنيه`
      ).join('\n');
      this.addMessage('أفضل النتائج:\n' + propertySummary, 'bot');

      // إضافة كارت لأول عقار
      const firstProp = response.properties[0];
      const propertyImage = 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1000&auto=format&fit=crop';
      this.addMessage('', 'bot', 'property', {
        id: firstProp.id || 1,
        title: `${firstProp.type || 'عقار'} في ${firstProp.city || ''}`,
        price: `${(firstProp.price || 0).toLocaleString()} جنيه`,
        image: propertyImage,
        specs: `${firstProp.bedrooms || '-'} غرف • ${firstProp.bathrooms || '-'} حمام • ${firstProp.size_sqm || '-'} م²`,
        fullProperty: { ...firstProp, displayImage: propertyImage } // تخزين العقار مع الصورة
      });
    } else if (response.type === 'results' || response.type === 'fallback') {
      this.addMessage('⚠️ لم يتم العثور على عقارات مطابقة', 'bot');
    }
  }

  async clearSession() {
    await this.chatbotService.clearSession();
    this.messages.set([{
      id: Date.now(),
      text: 'تم مسح المحادثة. ابدأ من جديد! 🔄',
      sender: 'bot',
      type: 'text',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  }

  viewPropertyDetails(propertyData: any) {
    // تخزين بيانات العقار في الـ service
    if (propertyData.fullProperty) {
      this.chatbotService.setSelectedChatProperty(propertyData.fullProperty);
    }
    this.chatbotService.close();
    this.router.navigate(['/property', propertyData.id || 1]);
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }
}