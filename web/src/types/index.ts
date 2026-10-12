export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface Service {
  id: string;
  categoryId: string;
  category?: ServiceCategory;
  name: string;
  slug?: string;
  description: string;
  price: number;
  discountedPrice?: number;
  durationMinutes?: number;
  duration?: string;
  features?: string[];
  imageUrl?: string;
  isPopular?: boolean;
}

export interface SparePart {
  id: string;
  name: string;
  slug?: string;
  partNumber?: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  discountedPrice?: number;
  stock?: number;
  imageUrl?: string;
  inStock?: boolean;
}

export interface UsedCarListing {
  id: string;
  title?: string;
  brand: string;
  model: string;
  year: number;
  variant?: string;
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'CNG' | 'Hybrid';
  transmission?: 'Manual' | 'Automatic';
  mileage: number; // or km driven
  mileageKm?: number;
  price: number;
  location: string;
  city?: string;
  viewCount: number;
  imageUrl?: string;
  images?: string[];
  ownersCount?: number;
}

export interface CmsPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
