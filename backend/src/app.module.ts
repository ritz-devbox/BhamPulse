import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedditModule } from './application/reddit/reddit.module';
import { RestaurantsModule } from './application/restaurants.module';
import { LoggerService } from './common/logging/logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedditModule,
    RestaurantsModule,
  ],
  providers: [LoggerService],
})
export class AppModule {}
