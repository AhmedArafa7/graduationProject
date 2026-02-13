import { Component, signal, inject, computed, OnInit, ViewChild, ElementRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';
import { UserService } from '../../../core/services/user.service';
import { MessagesService } from '../../../core/services/messages.service';
import { Conversation, Message } from '../../../core/models/chat.model';

@Component({
  selector: 'app-messages',
  imports: [CommonModule, FormsModule, AgentSidebarComponent],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.scss'
})
export class MessagesComponent implements OnInit {
  private userService = inject(UserService);
  private messagesService = inject(MessagesService);
  private route = inject(ActivatedRoute);
  private platformId = inject(PLATFORM_ID);
  
  @ViewChild('messageInput') messageInput!: ElementRef<HTMLInputElement>;
  
  userAvatar = computed(() => this.userService.getProfileImage());
  
  searchQuery = signal('');
  newMessage = signal('');
  selectedConversation = signal<Conversation | null>(null);

  conversations = this.messagesService.conversations;

  // الرسائل الحالية من المحادثة المختارة
  currentMessages = computed(() => {
    const conv = this.selectedConversation();
    return conv ? conv.messages : [];
  });

  ngOnInit() {
    // التحقق من query parameter لفتح محادثة محددة
    this.route.queryParams.subscribe(params => {
      const chatId = params['chat'];
      const convs = this.conversations();
      
      if (chatId) {
        // Compare loosely or as strings
        const targetConv = convs.find(c => String(c.id) === String(chatId));
        if (targetConv) {
          this.selectConversation(targetConv);
          return;
        }
      }
      
      // اختيار أول محادثة بشكل افتراضي
      if (convs.length > 0) {
        this.selectedConversation.set(convs[0]);
      }
    });
  }

  // تفعيل حقل الكتابة
  private focusInput() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.messageInput?.nativeElement?.focus();
      }, 100);
    }
  }

  selectConversation(conv: Conversation) {
    this.selectedConversation.set(conv);
    this.messagesService.markAsRead(conv.id);
    // تحديث المحادثة المختارة بعد تعليمها كمقروءة
    const updated = this.conversations().find(c => String(c.id) === String(conv.id));
    if (updated) {
      this.selectedConversation.set(updated);
    }
    // تفعيل حقل الكتابة
    this.focusInput();
  }

  sendMessage() {
    const text = this.newMessage().trim();
    const conv = this.selectedConversation();
    if (!text || !conv) return;

    // Use service to send
    this.messagesService.sendMessage(String(conv.id), text);
    
    // Service handles optimistic update
    
    this.newMessage.set('');
  }

  deleteConversation(conv: Conversation, event: Event) {
    event.stopPropagation();
    this.messagesService.deleteConversation(conv.id);
    if (this.selectedConversation()?.id === conv.id) {
      this.selectedConversation.set(this.conversations()[0] || null);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const conv = this.selectedConversation();
      if (!conv) return;

      const fileType = this.getFileType(file.name);
      const fileSize = this.formatFileSize(file.size);
      
      // For demo purposes, we can't easily upload real files to this simple backend without Multer.
      // We will simulate it by sending metadata.
      const attachment = {
        name: file.name,
        size: fileSize,
        type: fileType,
        url: '' // In real app, upload first then get URL
      };

      this.messagesService.sendMessage(String(conv.id), '', attachment);
      input.value = '';
    }
  }

  filteredConversations = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.conversations();
    return this.conversations().filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.lastMessage.toLowerCase().includes(query)
    );
  });

  private getFileType(filename: string): 'image' | 'pdf' | 'doc' | 'other' {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['doc', 'docx'].includes(ext)) return 'doc';
    return 'other';
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  getFileIcon(type: string): string {
    switch (type) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc': return 'description';
      case 'image': return 'image';
      default: return 'attach_file';
    }
  }
}
