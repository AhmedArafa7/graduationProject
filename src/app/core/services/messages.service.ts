import { Injectable, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Message {
  id: number;
  text: string;
  sender: 'user' | 'other';
  time: string;
  attachment?: {
    name: string;
    size: string;
    type: 'image' | 'pdf' | 'doc' | 'other';
    url?: string;
  };
}

export interface Conversation {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  online?: boolean;
  messages: Message[];
}

@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private platformId = inject(PLATFORM_ID);
  private STORAGE_KEY = 'baytology_messages';
  private VERSION_KEY = 'baytology_messages_version';
  private CURRENT_VERSION = 2;

  private conversationsSignal = signal<Conversation[]>([]);
  
  conversations = this.conversationsSignal.asReadonly();
  
  // عدد المحادثات غير المقروءة
  unreadCount = computed(() => 
    this.conversationsSignal().filter(c => c.unread).length
  );

  constructor() {
    // تحميل البيانات بعد التهيئة
    this.conversationsSignal.set(this.loadFromStorage());
  }

  private defaultConversations: Conversation[] = [
    {
      id: 1,
      name: 'Baytology',
      avatar: '/Baytology_image.png',
      lastMessage: 'استفسار عن: شقة في التجمع الخامس',
      time: '3:45 PM',
      unread: false,
      online: true,
      messages: [
        { id: 1, text: 'مرحباً! هذه رسالة تلقائية بخصوص استفسارك عن العقار في التجمع الخامس.', sender: 'other', time: '3:45 PM' },
        { id: 2, text: 'ممتاز، شكراً! أنا مهتم جداً وعايز أعرف أكتر عن المنطقة.', sender: 'user', time: '3:50 PM' },
        { id: 3, text: 'طبعاً. المنطقة معروفة بمدارسها الممتازة والحدائق. مناسبة جداً للعائلات.', sender: 'other', time: '3:52 PM' }
      ]
    },
    {
      id: 2,
      name: 'سلمى أحمد',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      lastMessage: 'أنا مهتمة بالعقار اللي عرضته',
      time: 'أمس',
      unread: false,
      messages: [
        { id: 1, text: 'مرحباً، أنا مهتمة بالعقار اللي عرضته في الزمالك', sender: 'other', time: '2:30 PM' },
        { id: 2, text: 'أهلاً سلمى! أيوه، العقار متاح للمعاينة.', sender: 'user', time: '2:35 PM' },
        { id: 3, text: 'ممتاز! ممكن نحدد موعد الأسبوع الجاي؟', sender: 'other', time: '2:40 PM' }
      ]
    },
    {
      id: 3,
      name: 'محمد علي',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      lastMessage: 'ممكن نحدد موعد للمعاينة؟',
      time: 'منذ يومين',
      unread: false,
      messages: [
        { id: 1, text: 'السلام عليكم، أنا شايف العقار ده على الموقع وعايز أعرف تفاصيل أكتر', sender: 'other', time: '10:00 AM' },
        { id: 2, text: 'وعليكم السلام محمد، العقار 3 غرف وصالة، التشطيب سوبر لوكس', sender: 'user', time: '10:15 AM' },
        { id: 3, text: 'ممكن نحدد موعد للمعاينة؟', sender: 'other', time: '10:20 AM' }
      ]
    }
  ];

  private loadFromStorage(): Conversation[] {
    if (!isPlatformBrowser(this.platformId)) return this.getDefaultConversations();
    
    try {
      // التحقق من الإصدار - لو مختلف، نمسح البيانات القديمة
      const storedVersion = localStorage.getItem(this.VERSION_KEY);
      if (storedVersion !== String(this.CURRENT_VERSION)) {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.setItem(this.VERSION_KEY, String(this.CURRENT_VERSION));
        return this.getDefaultConversations();
      }

      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not load messages');
    }
    return this.getDefaultConversations();
  }

  private getDefaultConversations(): Conversation[] {
    return [...this.defaultConversations];
  }

  private saveToStorage() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.conversationsSignal()));
    } catch (e) {
      console.warn('Could not save messages');
    }
  }

  getConversations() {
    return this.conversationsSignal();
  }

  markAsRead(id: number) {
    this.conversationsSignal.update(list => 
      list.map(c => c.id === id ? {...c, unread: false} : c)
    );
    this.saveToStorage();
  }

  markAllAsRead() {
    this.conversationsSignal.update(list => 
      list.map(c => ({...c, unread: false}))
    );
    this.saveToStorage();
  }

  // إعادة تعيين البيانات للافتراضي (مسح localStorage)
  resetToDefaults() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.STORAGE_KEY);
    }
    this.conversationsSignal.set(this.getDefaultConversations());
  }

  addMessage(conversationId: number, message: Message) {
    this.conversationsSignal.update(list => 
      list.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...c.messages, message],
            lastMessage: message.text || `📎 ${message.attachment?.name || 'مرفق'}`,
            time: 'الآن'
          };
        }
        return c;
      })
    );
    this.saveToStorage();
  }

  deleteConversation(id: number) {
    this.conversationsSignal.update(list => list.filter(c => c.id !== id));
    this.saveToStorage();
  }

  // عند استلام رسالة جديدة
  receiveMessage(conversationId: number, text: string) {
    const msg: Message = {
      id: Date.now(),
      text,
      sender: 'other',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    this.conversationsSignal.update(list => 
      list.map(c => {
        if (c.id === conversationId) {
          return {
            ...c,
            messages: [...c.messages, msg],
            lastMessage: text,
            time: 'الآن',
            unread: true
          };
        }
        return c;
      })
    );
    this.saveToStorage();
  }
}
