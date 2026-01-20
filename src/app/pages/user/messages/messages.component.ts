import { Component, signal, inject, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AgentSidebarComponent } from '../../../shared/agent-sidebar/agent-sidebar.component';
import { UserService } from '../../../core/services/user.service';
import { MessagesService, Conversation, Message } from '../../../core/services/messages.service';

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
        const targetConv = convs.find(c => c.id === Number(chatId));
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

  selectConversation(conv: Conversation) {
    this.selectedConversation.set(conv);
    this.messagesService.markAsRead(conv.id);
    // تحديث المحادثة المختارة بعد تعليمها كمقروءة
    const updated = this.conversations().find(c => c.id === conv.id);
    if (updated) {
      this.selectedConversation.set(updated);
    }
  }

  sendMessage() {
    const text = this.newMessage().trim();
    const conv = this.selectedConversation();
    if (!text || !conv) return;

    const newMsg: Message = {
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    this.messagesService.addMessage(conv.id, newMsg);
    
    // تحديث المحادثة المختارة
    const updatedConv = this.conversations().find(c => c.id === conv.id);
    if (updatedConv) {
      this.selectedConversation.set(updatedConv);
    }

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
      
      let fileUrl: string | undefined;
      if (fileType === 'image') {
        fileUrl = URL.createObjectURL(file);
      }

      const newMsg: Message = {
        id: Date.now(),
        text: '',
        sender: 'user',
        time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        attachment: {
          name: file.name,
          size: fileSize,
          type: fileType,
          url: fileUrl
        }
      };

      this.messagesService.addMessage(conv.id, newMsg);

      const updatedConv = this.conversations().find(c => c.id === conv.id);
      if (updatedConv) {
        this.selectedConversation.set(updatedConv);
      }

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
