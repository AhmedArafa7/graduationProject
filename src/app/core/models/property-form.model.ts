import { RoomDimension, PropertyAmenities } from './agent-property.model';

export interface PropertyImage {
  file: File;
  preview: string;
  status: string;
  altText: string;
}

export interface PropertyForm {
  title: string;
  propertyType: string;
  status: string;
  price: number | null;
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor: number | null;
  roomDimensions: RoomDimension[];
  description: string;
  latitude: string;
  longitude: string;
  locationId: string;
  amenities: PropertyAmenities;
  images: PropertyImage[];
}
