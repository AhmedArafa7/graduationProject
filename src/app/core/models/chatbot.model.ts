export interface ChatProperty {
  id?: number;
  type?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  size_sqm?: number;
  price?: number;
  location?: string;
  area?: string;
  floor?: string;
  payment_option?: string;
  furnished?: string;
  displayImage?: string; // الصورة المعروضة في الشات
}

export interface ChatResponse {
  message?: string;
  question?: string;
  filters?: Record<string, any>;
  properties?: ChatProperty[];
  type?: string;
  properties_count?: number;
  attribute?: string;
}
export interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  type: 'text' | 'property' | 'question';
  data?: any;
  time: string;
}
