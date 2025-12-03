import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedditModule as InfraRedditModule } from '../../infrastructure/reddit/reddit.module';
import { PostRepository } from '../../infrastructure/repositories/post.repository';
import { RedditController } from './reddit.controller';
import { RedditService } from './reddit.service';

@Module({
  imports: [InfraRedditModule],
  controllers: [RedditController],
  providers: [RedditService, PostRepository, PrismaService],
})
export class RedditModule {}
