import { Injectable, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Notification {
  id: number;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'message' | 'property' | 'system' | 'price';
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private platformId = inject(PLATFORM_ID);
  private STORAGE_KEY = 'baytology_notifications';
  
  // قائمة الإشعارات
  private notificationsSignal = signal<Notification[]>(this.loadFromStorage());
  
  // للقراءة فقط
  notifications = this.notificationsSignal.asReadonly();
  
  // عدد الإشعارات غير المقروءة
  unreadCount = computed(() => this.notificationsSignal().filter(n => !n.read).length);
  
  // هل هناك إشعارات جديدة (للأنيميشن)
  hasNewNotification = signal(false);

  // صوت الإشعار
  private notificationSound: HTMLAudioElement | null = null;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.notificationSound = new Audio();
      this.notificationSound.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYbFNTxRAAAAAAAAAAAAAAAAAAAAAP/7UMQAA8AAAaQAAAAgAAA0gAAABExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7UMQeA8AAAaQAAAAgAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVQ==';
      this.notificationSound.volume = 0.3;
    }
  }

  private loadFromStorage(): Notification[] {
    if (!isPlatformBrowser(this.platformId)) return this.getDefaultNotifications();
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((n: any) => ({ ...n, time: new Date(n.time) }));
      }
    } catch (e) {
      console.warn('Could not load notifications');
    }
    return this.getDefaultNotifications();
  }

  private saveToStorage() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.notificationsSignal()));
    } catch (e) {
      console.warn('Could not save notifications');
    }
  }

  private getDefaultNotifications(): Notification[] {
    return [
      {
        id: 1,
        title: 'مرحباً بك في Baytology!',
        message: 'نتمنى لك تجربة ممتعة في البحث عن عقارك المثالي',
        time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        read: false,
        type: 'system',
        icon: 'waving_hand'
      }
    ];
  }

  private getIcon(type: string): string {
    switch (type) {
      case 'message': return 'chat_bubble';
      case 'property': return 'home';
      case 'price': return 'trending_down';
      case 'system': return 'info';
      default: return 'notifications';
    }
  }

  // إضافة إشعار جديد
  addNotification(title: string, message: string, type: 'message' | 'property' | 'system' | 'price' = 'system') {
    const newNotification: Notification = {
      id: Date.now(),
      title,
      message,
      time: new Date(),
      read: false,
      type,
      icon: this.getIcon(type)
    };
    
    this.notificationsSignal.update(list => [newNotification, ...list]);
    this.hasNewNotification.set(true);
    this.saveToStorage();
    
    this.playSound();
    
    setTimeout(() => {
      this.hasNewNotification.set(false);
    }, 3000);
  }

  private playSound() {
    if (isPlatformBrowser(this.platformId) && this.notificationSound) {
      this.notificationSound.currentTime = 0;
      this.notificationSound.play().catch(() => {});
    }
  }

  // قراءة إشعار
  markAsRead(id: number) {
    this.notificationsSignal.update(list => 
      list.map(n => n.id === id ? {...n, read: true} : n)
    );
    this.saveToStorage();
  }

  // قراءة جميع الإشعارات
  markAllAsRead() {
    this.notificationsSignal.update(list => 
      list.map(n => ({...n, read: true}))
    );
    this.saveToStorage();
  }

  // حذف إشعار
  deleteNotification(id: number) {
    this.notificationsSignal.update(list => list.filter(n => n.id !== id));
    this.saveToStorage();
  }

  // مسح جميع الإشعارات
  clearAll() {
    this.notificationsSignal.set([]);
    this.saveToStorage();
  }

  // طرق مختصرة لإضافة إشعارات محددة
  notifyNewMessage(senderName: string, propertyTitle?: string) {
    const message = propertyTitle 
      ? `رسالة جديدة من ${senderName} بخصوص ${propertyTitle}`
      : `رسالة جديدة من ${senderName}`;
    this.addNotification('رسالة جديدة', message, 'message');
  }

  notifyPropertyAdded(propertyTitle: string) {
    this.addNotification('تم إضافة العقار', `تم إضافة "${propertyTitle}" بنجاح`, 'property');
  }

  notifyPropertySold(propertyTitle: string) {
    this.addNotification('تم بيع العقار', `تهانينا! تم بيع "${propertyTitle}"`, 'property');
  }

  notifyPriceChange(propertyTitle: string, oldPrice: number, newPrice: number) {
    const direction = newPrice < oldPrice ? 'انخفض' : 'ارتفع';
    this.addNotification('تغيير السعر', `${direction} سعر "${propertyTitle}"`, 'price');
  }

  notifyFavoriteUpdate(propertyTitle: string, status: string) {
    this.addNotification('تحديث المفضلة', `تم تحديث حالة "${propertyTitle}" إلى ${status}`, 'property');
  }
}
