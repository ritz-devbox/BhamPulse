import { Module } from '@nestjs/common';
import { RedditClient } from './reddit.client';
import { RedditRepository } from './reddit.repository';

@Module({
  providers: [RedditClient, RedditRepository],
  exports: [RedditRepository],
})
export class RedditModule {}
