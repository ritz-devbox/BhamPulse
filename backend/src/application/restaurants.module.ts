import { Module } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { GoogleModule } from '../infrastructure/google/google.module';
import { RestaurantMapper } from '../infrastructure/mappers/restaurant.mapper';
import { RestaurantsController } from './restaurants.controller';
import { RestaurantsService } from './restaurants.service';
import { HikesService } from './hikes.service';
import { HikesController } from './hikes.controller';

@Module({
  imports: [GoogleModule],
  controllers: [RestaurantsController, HikesController],
  providers: [RestaurantsService, HikesService, PrismaService, RestaurantMapper],
})
export class RestaurantsModule {}
