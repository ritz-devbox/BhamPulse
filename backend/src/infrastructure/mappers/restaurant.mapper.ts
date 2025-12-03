import { Restaurant } from "../../domain/models/restaurant.model";

export class RestaurantMapper {
  static fromGooglePlace(item: any, details?: any): Restaurant {
    return {
      name: item.name,
      address: item.formatted_address ?? undefined,
      latitude: item.geometry?.location?.lat ?? undefined,
      longitude: item.geometry?.location?.lng ?? undefined,
      rating: item.rating ?? undefined,
      priceLevel: item.price_level ?? undefined,
      categories: item.types ? item.types.join(',') : undefined,
      googlePlaceId: item.place_id,
      website: details?.website ?? undefined,
      menuUrl: details?.menu ?? undefined,
      photoUrl: item.photos?.[0]?.photo_reference ?? undefined
    };
  }
}
