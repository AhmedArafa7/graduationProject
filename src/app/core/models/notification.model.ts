export interface Notification {
  _id?: string;
  id?: number | string;
  title: string;
  message: string;
  time?: Date;
  read: boolean;
  type: 'message' | 'property' | 'system' | 'price';
  icon: string;
  userId?: string; // Added from usage in service
}
