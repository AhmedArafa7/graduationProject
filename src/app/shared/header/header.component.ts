import { Component, inject, computed, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  public notificationService = inject(NotificationService);
  
  // استخدام Logo Baytology
  logoUrl = '/Baytology_image.png'; 
  
  // حالة تسجيل الدخول من الـ UserService
  isLoggedIn = computed(() => this.userService.isLoggedIn());
  
  // صورة المستخدم من الـ UserService
  userAvatar = computed(() => this.userService.getProfileImage());
  
  // اسم المستخدم
  userName = computed(() => this.userService.getFullName());
  
  // هل المستخدم وكيل؟
  isAgent = computed(() => this.userService.userData().userType === 'agent');
  
  // عدد الإشعارات غير المقروءة
  unreadCount = computed(() => this.notificationService.unreadCount());
  
  // هل هناك إشعار جديد (للأنيميشن)
  hasNewNotification = computed(() => this.notificationService.hasNewNotification());
  
  // حالة القائمة الجانبية (Mobile Menu)
  isMobileMenuOpen = signal(false);
  
  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }

  // حالة القائمة المنسدلة
  isDropdownOpen = signal(false);
  
  toggleDropdown() {
    this.isDropdownOpen.update(v => !v);
  }
  
  closeDropdown() {
    this.isDropdownOpen.set(false);
  }
  
  logout() {
    this.userService.logout();
    this.closeDropdown();
    this.router.navigate(['/']);
  }
}