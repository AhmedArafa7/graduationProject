export interface Review {
  _id?: string;
  id?: string; // Changed to string
  targetId: string; // agentId or propertyId (string)
  targetType: 'agent' | 'property';
  author: string;
  avatar: string;
  rating: number; // 1-5
  text: string;
  date: string;
  createdAt?: string;
}
