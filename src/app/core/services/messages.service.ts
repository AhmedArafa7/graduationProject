import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserService } from './user.service';
import { Observable, map } from 'rxjs';

export interface Message {
  id: string | number; // Support string IDs from backend
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
  id: string | number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  unreadCount?: number;
  online?: boolean;
  messages: Message[];
}

@Injectable({
  providedIn: 'root'
})
@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private apiUrl = `${environment.apiUrl}/chat`;
  
  private conversationsSignal = signal<Conversation[]>([]);
  public conversations = this.conversationsSignal.asReadonly();
  
  public unreadCount = computed(() => 
    this.conversationsSignal().reduce((acc, curr) => acc + (curr.unreadCount || (curr.unread ? 1 : 0)), 0)
  );

  constructor() {
    // Load if user is logged in
    if (this.userService.userData()) {
      this.loadConversations();
    }
  }

  loadConversations() {
    const userId = this.userService.userData()._id;
    if (!userId) return;

    this.http.get<any[]>(`${this.apiUrl}?userId=${userId}`).pipe(
      map(data => data.map(this.mapBackendConversation))
    ).subscribe({
      next: (data) => this.conversationsSignal.set(data),
      error: (err) => console.error('Failed to load conversations', err)
    });
  }

  getMessages(conversationId: string): Observable<Message[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${conversationId}/messages`).pipe(
      map(msgs => msgs.map(this.mapBackendMessage))
    );
  }

  sendMessage(conversationId: string, text: string, attachment?: any) {
    const senderId = this.userService.userData()._id;
    if (!senderId) return;

    this.http.post<any>(`${this.apiUrl}/${conversationId}/messages`, {
      text,
      senderId,
      attachment
    }).subscribe({
      next: (newMsg) => {
        // Optimistic update of conversation list (last message)
        this.conversationsSignal.update(list => list.map(c => {
          if (String(c.id) === String(conversationId)) {
            return { 
              ...c, 
              lastMessage: text || 'مرفق', 
              time: 'الآن',
              messages: [...(c.messages || []), this.mapBackendMessage(newMsg)] 
            };
          }
          return c;
        }));
      },
      error: (err) => console.error('Failed to send message', err)
    });
  }

  startChatWithAgent(agentName: string, agentImage: string, agentId: string): Observable<string> { // Returns Conversation ID
    const userId = this.userService.userData()._id;
    if (!userId) {
       // Handle not logged in - maybe return error or prompt login
       return new Observable(obs => obs.error('Must be logged in'));
    }

    const payload = {
      participants: [userId, agentId], // Assuming agentId is passed
      participantsDetails: [
        { id: userId, name: 'أنت', role: 'user' },
        { id: agentId, name: agentName, avatar: agentImage, role: 'agent' }
      ]
    };

    return this.http.post<any>(this.apiUrl, payload).pipe(
      map(res => {
        this.loadConversations(); // Refresh list
        return res._id;
      })
    );
  }

  markAsRead(conversationId: string | number) {
    // In real app, call API to mark read. For now just local update + maybe silent api call
    this.conversationsSignal.update(list => 
      list.map(c => String(c.id) === String(conversationId) ? {...c, unread: false, unreadCount: 0} : c)
    );
  }
  
  markAllAsRead() {
    this.conversationsSignal.update(list => 
      list.map(c => ({...c, unread: false, unreadCount: 0}))
    );
  }

  deleteConversation(id: string | number) {
     // Implement API delete if supported
     this.conversationsSignal.update(list => list.filter(c => String(c.id) !== String(id)));
  }

  // Mappers
  private mapBackendConversation(item: any): Conversation {
    return {
      id: item._id,
      name: item.participantsDetails?.find((p: any) => p.role === 'agent')?.name || 'Agent', // Simplified logic
      avatar: item.participantsDetails?.find((p: any) => p.role === 'agent')?.avatar || '/assets/images/user-placeholder.png',
      lastMessage: item.lastMessage,
      time: new Date(item.updatedAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}),
      unread: item.unreadCount > 0,
      unreadCount: item.unreadCount,
      messages: [] // Loaded on demand usually
    };
  }

  private mapBackendMessage(item: any): Message {
    return {
      id: item._id,
      text: item.text,
      sender: item.senderId === item.senderId ? 'user' : 'other', // Logic needs current User ID comparison
      time: new Date(item.createdAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'}),
      attachment: item.attachment
    };
  }
}
