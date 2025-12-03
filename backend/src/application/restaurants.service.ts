import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GoogleRepository } from '../infrastructure/google/google.repository';
import { RestaurantMapper } from '../infrastructure/mappers/restaurant.mapper';

@Injectable()
export class RestaurantsService {
  constructor(
    private readonly google: GoogleRepository,
    private readonly prisma: PrismaService
  ) {}

  async syncRestaurants() {
    const result = await this.google.searchRestaurantsInBirmingham();

    for (const item of result.results) {
      const details = await this.google.getRestaurantDetails(item.place_id);
      const mapped = RestaurantMapper.fromGooglePlace(item, details.result);

      await this.prisma.restaurant.upsert({
        where: { googlePlaceId: item.place_id },
        update: {
          ...mapped
        },
        create: {
          ...mapped
        }
      });
    }

    return { success: true };
  }

  async listRestaurants() {
    return this.prisma.restaurant.findMany();
  }
}
