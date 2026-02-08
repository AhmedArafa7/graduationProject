import { Component, inject, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { MessagesService } from '../../core/services/messages.service';

@Component({
  selector: 'app-agent-sidebar',
  imports: [CommonModule, RouterLink],
  templateUrl: './agent-sidebar.component.html',
  styleUrl: './agent-sidebar.component.scss'
})
export class AgentSidebarComponent {
  private userService = inject(UserService);
  private messagesService = inject(MessagesService);
  private router = inject(Router);

  // الصفحة الحالية
  currentPage = input<'overview' | 'properties' | 'messages' | 'profile' | 'favorites' | 'notifications'>('overview');

  // بيانات المستخدم
  userAvatar = computed(() => this.userService.getProfileImage());
  userName = computed(() => this.userService.getFullName());
  isAgent = computed(() => this.userService.userData().userType === 'agent');

  // عدد الرسائل الجديدة (غير المقروءة)
  newMessages = computed(() => this.messagesService.unreadCount());

  // Mobile Menu State
  isOpen = signal(false);

  toggle() {
    this.isOpen.update(v => !v);
  }

  close() {
    this.isOpen.set(false);
  }

  logout() {
    this.userService.logout();
    this.router.navigate(['/']);
  }
}
