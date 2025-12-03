import { Controller, Get, Post } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly service: RestaurantsService) {}

  @Post('sync')
  async sync() {
    return await this.service.syncRestaurants();
  }

  @Get()
  async list() {
    return await this.service.listRestaurants();
  }
}
