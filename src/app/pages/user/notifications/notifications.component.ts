import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';
import { NotificationService, Notification } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, AgentSidebarComponent],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);

  activeFilter = signal<'all' | 'messages' | 'property' | 'system'>('all');

  // استخدام الخدمة المشتركة
  allNotifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  notifications = computed(() => {
    const filter = this.activeFilter();
    const all = this.allNotifications();
    
    if (filter === 'all') return all;
    if (filter === 'messages') return all.filter(n => n.type === 'message');
    if (filter === 'property') return all.filter(n => n.type === 'property' || n.type === 'price');
    if (filter === 'system') return all.filter(n => n.type === 'system');
    return all;
  });

  setFilter(filter: 'all' | 'messages' | 'property' | 'system') {
    this.activeFilter.set(filter);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  dismissNotification(id: number | string | undefined) {
    if (!id) return;
    this.notificationService.deleteNotification(id);
  }

  getIconColor(type: string): string {
    switch (type) {
      case 'message': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'price': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'property': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      case 'system': return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      default: return 'bg-primary/10 text-primary';
    }
  }

  formatTime(date: Date | undefined): string {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} أيام`;
    return `منذ أسبوع`;
  }
}
