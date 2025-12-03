export interface Restaurant {
  id?: string;
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  priceLevel?: number;
  cuisine?: string;
  categories?: string;
  googlePlaceId: string;
  website?: string;
  menuUrl?: string;
  photoUrl?: string;
}
