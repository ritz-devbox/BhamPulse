import { Injectable } from '@nestjs/common';
import { RedditClient } from './reddit.client';

@Injectable()
export class RedditRepository {
  constructor(private readonly client: RedditClient) {}

  async fetchPosts(subreddit: string, sort: 'hot' | 'new' | 'top', limit: number) {
    const response = await this.client.fetchSubreddit(subreddit, sort, limit);
    return response?.data?.children?.map((child: any) => child.data) ?? [];
  }
}
