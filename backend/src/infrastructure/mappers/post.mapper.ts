import { Post } from '../../domain/models/post.model';
import { Category } from '../../domain/enums/category.enum';

export class PostMapper {
  static fromReddit(item: any, category: Category | null): Post {
    return {
      redditId: item.id,
      title: item.title,
      author: item.author,
      content: item.selftext?.trim() || null,
      flair: item.link_flair_text ?? null,
      createdUtc: item.created_utc,
      media: item.url_overridden_by_dest ?? null,
      category,
      url: `https://www.reddit.com${item.permalink}`,
    };
  }
}
