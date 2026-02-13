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
