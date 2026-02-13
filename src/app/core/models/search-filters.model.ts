export interface SearchFilters {
  type: string;
  transactionType: 'all' | 'buy' | 'rent';
  priceFrom: number | null;
  priceTo: number | null;
  beds: string;
  baths: string;
  amenities: {
    pool: boolean;
    garden: boolean;
    garage: boolean;
    balcony: boolean;
  };
}
