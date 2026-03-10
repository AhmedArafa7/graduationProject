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
  currentPage = input<'overview' | 'properties' | 'messages' | 'profile' | 'favorites' | 'notifications' | 'saved-searches'>('overview');

  // بيانات المستخدم
  userAvatar = computed(() => this.userService.getProfileImage());
  pendingProfileImage = signal<string | null>(null);
  userName = computed(() => this.userService.getFullName());
  isAgent = computed(() => ['agent', 'owner'].includes(this.userService.userData().userType));

  isImageFullscreen = signal(false);

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

  // --- Image Handling (Mirroring Profile Component) ---
  triggerFileInput(fileInput: HTMLInputElement, event: Event) {
    event.stopPropagation(); // Prevent opening fullscreen when clicking edit icon
    fileInput.click();
  }

  onImageClick() {
    this.isImageFullscreen.set(true);
  }

  closeFullscreenImage() {
    this.isImageFullscreen.set(false);
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        // toast not injected, using alert for simplicity in sidebar or we can inject toast
        alert('يرجى اختيار ملف صورة صحيح');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const base64Image = e.target?.result as string;
        this.pendingProfileImage.set(base64Image);
        
        // Auto-save in sidebar since there is no "Save Changes" button
        const currentUser = this.userService.userData(); 
        const userId = currentUser._id || '1'; 
        if (userId) {
          this.userService.updateProfileImage(userId, base64Image).subscribe({
            next: () => {
              this.pendingProfileImage.set(null); // Clear pending since it's saved to service
            },
            error: () => alert('حدث خطأ أثناء رفع الصورة')
          });
        }
      };
      reader.readAsDataURL(file);
    }
  }
}
