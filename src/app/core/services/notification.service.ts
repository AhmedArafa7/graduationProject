import { Injectable, signal, inject, computed, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';

export interface Notification {
  _id?: string;
  id?: number | string;
  title: string;
  message: string;
  time?: Date;
  read: boolean;
  type: 'message' | 'property' | 'system' | 'price';
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private userService = inject(UserService); // Inject User Service
  private apiUrl = `${environment.apiUrl}/notifications`;
  
  // قائمة الإشعارات
  private notificationsSignal = signal<Notification[]>([]);
  
  // للقراءة فقط
  notifications = this.notificationsSignal.asReadonly();
  
  // عدد الإشعارات غير المقروءة
  unreadCount = computed(() => this.notificationsSignal().filter(n => !n.read).length);
  
  // هل هناك إشعارات جديدة (للأنيميشن)
  hasNewNotification = signal(false);

  private platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadNotifications();
    }
  }

  loadNotifications() {
    this.http.get<Notification[]>(this.apiUrl).subscribe({
      next: (data: Notification[]) => this.notificationsSignal.set(data),
      error: (err: any) => console.error('Failed to load notifications', err)
    });
  }

  // إضافة إشعار جديد
  addNotification(title: string, message: string, type: 'message' | 'property' | 'system' | 'price' = 'system') {
    const userId = this.userService.userData()._id || 'anonymous'; // Fallback if needed, but preferably catch earlier

    const newNotification = {
      title,
      message,
      type,
      read: false,
      icon: this.getIcon(type),
      userId: userId
    };
    
    // In real app we might not post notification from client side like this, usually backend creates it.
    // But for now keeping the method signature.
    this.http.post<Notification>(this.apiUrl, newNotification).subscribe({
      next: (saved: Notification) => {
        this.notificationsSignal.update(list => [saved, ...list]);
        this.hasNewNotification.set(true);
        setTimeout(() => this.hasNewNotification.set(false), 3000);
      },
      error: (err: any) => console.error('Failed to add notification', err)
    });
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

  // قراءة إشعار
  markAsRead(id: number | string) {
    this.http.put(`${this.apiUrl}/${id}`, { read: true }).subscribe({
      next: () => {
        this.notificationsSignal.update(list => 
          list.map(n => n.id === id || n._id === id ? {...n, read: true} : n)
        );
      },
      error: (err: any) => console.error('Failed to mark notification as read', err)
    });
  }

  // قراءة جميع الإشعارات
  markAllAsRead() {
    // Assuming backend has batch update or loop
    // For simplicity loop here or better add batch endpoint
    this.notificationsSignal.update(list => 
      list.map(n => ({...n, read: true}))
    );
    // Sync with backend (optimistically)
    // Maybe call an endpoint /notifications/mark-all-read in future
  }

  // حذف إشعار
  deleteNotification(id: number | string) {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.notificationsSignal.update(list => list.filter(n => n.id !== id && n._id !== id));
      },
      error: (err: any) => console.error('Failed to delete notification', err)
    });
  }

  // مسح جميع الإشعارات
  clearAll() {
    this.notificationsSignal.set([]);
    // Call backend to delete all
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
