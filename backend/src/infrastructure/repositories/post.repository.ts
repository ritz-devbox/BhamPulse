import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { Post } from '../../domain/models/post.model';
import { Category } from '../../domain/enums/category.enum';

export interface ListPostsParams {
  category?: Category;
  search?: string;
  limit?: number;
}

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertMany(posts: Post[]): Promise<void> {
    await Promise.all(
      posts.map((post) =>
        this.prisma.post.upsert({
          where: { redditId: post.redditId },
          update: {
            title: post.title,
            author: post.author,
            content: post.content,
            flair: post.flair,
            createdUtc: post.createdUtc,
            media: post.media,
            category: post.category,
            url: post.url,
          },
          create: {
            redditId: post.redditId,
            title: post.title,
            author: post.author,
            content: post.content,
            flair: post.flair,
            createdUtc: post.createdUtc,
            media: post.media,
            category: post.category,
            url: post.url,
          },
        })
      )
    );
  }

  async list(params: ListPostsParams) {
    const { category, search, limit = 50 } = params;
    const take = Math.min(limit, 500);

    return this.prisma.post.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search } },
                { content: { contains: search } },
                { flair: { contains: search } },
              ],
            }
          : {}),
      },
      take,
      orderBy: { createdUtc: 'desc' },
    });
  }
}
