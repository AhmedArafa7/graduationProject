export interface FavoriteProperty {
  id: string; // Changed to string
  image: string;
  price: number; // Changed to number
  address: string;
  beds: number;
  baths: number;
  area: number; // Changed to number
  type: 'sale' | 'rent';
}
