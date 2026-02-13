export interface PropertyAmenities {
  pool: boolean;
  garage: boolean;
  gym: boolean;
  garden: boolean;
  balcony: boolean;
  security: boolean;
  ac: boolean;
  petFriendly: boolean;
}

export interface RoomDimension {
  name: string;
  length: number | null;
  width: number | null;
}

export interface AgentProperty {
  id: string; // Changed to string
  image: string;
  address: string;
  price: string;
  status: 'للبيع' | 'للإيجار' | 'مباع' | 'معلق';
  statusColor: string;
  createdAt: string;
  // Extended fields
  propertyType?: string;
  priceValue?: number;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  roomDimensions?: RoomDimension[];
  description?: string;
  latitude?: string;
  longitude?: string;
  locationId?: string;
  amenities?: PropertyAmenities;
  images?: string[];
}
