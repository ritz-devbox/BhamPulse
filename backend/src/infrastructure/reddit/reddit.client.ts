import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class RedditClient {
  private readonly logger = new Logger(RedditClient.name);
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: 'https://www.reddit.com',
      headers: { 'User-Agent': 'BhamPulse/1.0' },
    });
  }

  async fetchSubreddit(subreddit: string, sort: 'hot' | 'new' | 'top' = 'hot', limit = 25) {
    const path = `/r/${subreddit}/${sort}.json`;
    const { data } = await this.http.get(path, { params: { limit } });
    this.logger.debug(`Fetched ${data?.data?.children?.length ?? 0} posts from r/${subreddit}`);
    return data;
  }
}
