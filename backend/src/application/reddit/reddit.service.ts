import { Injectable } from '@nestjs/common';
import { Category } from '../../domain/enums/category.enum';
import { Post } from '../../domain/models/post.model';
import { PostMapper } from '../../infrastructure/mappers/post.mapper';
import { RedditRepository } from '../../infrastructure/reddit/reddit.repository';
import { PostRepository } from '../../infrastructure/repositories/post.repository';
import { classifyCategory } from '../../utils/category.classifier';

@Injectable()
export class RedditService {
  constructor(
    private readonly repository: RedditRepository,
    private readonly posts: PostRepository,
  ) {}

  async syncPosts(subreddit: string, sort: 'hot' | 'new' | 'top' = 'hot', limit = 25): Promise<Post[]> {
    const posts = await this.repository.fetchPosts(subreddit, sort, limit);
    const mapped = posts.map((item: any) => {
      const category = classifyCategory(item.title, item.link_flair_text) ?? Category.Other;
      return PostMapper.fromReddit(item, category);
    });

    await this.posts.upsertMany(mapped);
    return mapped;
  }

  async listPosts(params: { category?: Category; search?: string; limit?: number }) {
    return this.posts.list(params);
  }
}
