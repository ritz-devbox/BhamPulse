import { Injectable } from '@nestjs/common';
import { GoogleClient } from './google.client';

@Injectable()
export class GoogleRepository {
  constructor(private readonly client: GoogleClient) {}

  async searchRestaurantsInBirmingham() {
    return await this.client.search("restaurants in Birmingham UK");
  }

  async getRestaurantDetails(placeId: string) {
    return await this.client.getDetails(placeId);
  }
}
