export interface ComparisonProperty {
  id: number | string;
  title: string;
  price: string | number; // Handling "15,000,000" string or number
  area: string | number; // "500 m2" or 500
  location: string;
  beds: number;
  baths: number;
  image?: string;
  _id?: string;
  coverImage?: string;
  images?: string[];
  [key: string]: any;
}

export interface ComparisonResult {
  winnerId: number | string;
  analysis: Record<string | number, {
    pros: string[];
    cons: string[];
    score: number;
  }>;
  summary: string;
}
