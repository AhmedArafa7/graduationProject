import { Agent } from './agent.model';

export interface PropertyAmenity {
  icon: string;
  label: string;
}

export interface PropertyAiAnalysis {
  status: 'high' | 'fair' | 'low';
  percentage: number;
  label: string;
}

export interface Property {
  id?: string; // Unified ID
  _id?: string; // MongoDB ID fallback // MongoDB ID
  title: string;
  description: string;
  price: number;
  currency: string;
  area: number;
  location: {
    city: string;
    address: string;
    coordinates?: {
      type: 'Point';
      coordinates: number[]; // [lng, lat]
    };
  };
  type: 'sale' | 'rent';
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  images: string[];
  coverImage?: string;
  features: string[];
  agent: Agent; // Populated agent
  createdAt: string;
  isFeatured?: boolean;
  status?: string;
  
  // Frontend specific / Optional placeholders
  amenities?: PropertyAmenity[]; 
  tag?: string; 
  refCode?: string;
  aiAnalysis?: PropertyAiAnalysis;
}
