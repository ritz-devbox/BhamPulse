import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FetchPostsDto } from './dto/fetch-posts.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { RedditService } from './reddit.service';

@Controller('reddit')
export class RedditController {
  constructor(private readonly service: RedditService) {}

  // Trigger a fetch from Reddit and persist results
  @Post('sync')
  async sync(@Body() body: FetchPostsDto) {
    const { subreddit, sort = 'hot', limit = 25 } = body;
    return this.service.syncPosts(subreddit, sort, limit);
  }

  // Read posts from the database with optional filters
  @Get('posts')
  async list(@Query() query: ListPostsDto) {
    return this.service.listPosts(query);
  }
}
