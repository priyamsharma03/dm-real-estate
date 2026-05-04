export type PropertyType = 'Plot' | 'Flat' | 'House' | 'Bungalow';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  price: number;
  width?: number | null;
  length?: number | null;
  location: string;
  shortDescription: string;
  description: string;
  amenities: string[];
  images: string[];
  featured?: boolean;
  createdAt?: string;
}

export interface PropertyFilters {
  maxPrice?: number | null;
  location?: string | null;
  type?: PropertyType | 'All' | null;
  sort?: 'priceAsc' | 'priceDesc' | '' | null;
}