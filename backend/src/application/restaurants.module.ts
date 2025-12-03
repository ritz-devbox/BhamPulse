import { Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GoogleModule } from '../infrastructure/google/google.module';
import { RestaurantMapper } from '../infrastructure/mappers/restaurant.mapper';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';

@Module({
  imports: [GoogleModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService, PrismaService, RestaurantMapper],
})
export class RestaurantsModule {}
