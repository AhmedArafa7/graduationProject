import { Component, signal, ViewChild, ElementRef, afterNextRender, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../../core/services/chatbot/chatbot.service'; // تأكد من المسار

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  type: 'text' | 'property';
  data?: any;
  time: string;
}

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

  isTyping = signal(false);
  inputText = signal('');

  messages = signal<Message[]>([
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
    afterNextRender(() => {
      this.scrollToBottom();
    });
  }

  toggleChat() {
    this.chatbotService.toggle();
  }

  sendMessage(text: string = this.inputText()) {
    if (!text.trim()) return;

    this.addMessage(text, 'user');
    this.inputText.set('');
    this.isTyping.set(true);

    setTimeout(() => {
      this.isTyping.set(false);
      this.handleBotResponse(text);
    }, 1500);
  }

  private addMessage(text: string, sender: 'user' | 'bot', type: 'text' | 'property' = 'text', data?: any) {
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

  private handleBotResponse(userText: string) {
    if (userText.includes('شقة') || userText.includes('إيجار')) {
      this.addMessage('وجدنا لك بعض الخيارات المميزة بناءً على طلبك:', 'bot');
      this.addMessage('', 'bot', 'property', {
        title: 'شقة مودرن في التجمع الخامس',
        price: '12,500,000 ج.م',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBPLZkooCW_VeFTrupwlgxhBxoWjSz1Sc004mIXj4zMUlDHeINeFQDTiGDcgCNdRVmNwXvXtlxrF5UljFOpDRARyznYhS7PvtV70KqH2mrZ_RHTVZkedrHYCZZC0gKVWOSUuWgREFWgYtfU_5hUPn_tYml10L27a4cRt6m_t-hDNbSgC_3RrpqoCexPgwwQZ9GlDVgTF5UXIVHvg4FHsQkTtLVvNi34tmjsYvBu18wW_vtk2SjTMcjfNNRSZEBtw9yLIpBj1RuFRk',
        specs: '4 غرف • 5 حمام • 450 م²'
      });
    } else {
      this.addMessage('فهمت، هل يمكنك تزويدي بمزيد من التفاصيل؟', 'bot');
    }
  }

  private scrollToBottom() {
    if (this.scrollContainer) {
      setTimeout(() => {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      }, 100);
    }
  }
}