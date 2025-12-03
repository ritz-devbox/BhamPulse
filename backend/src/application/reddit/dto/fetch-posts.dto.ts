import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FetchPostsDto {
  @IsString()
  subreddit: string;

  @IsOptional()
  @IsString()
  sort?: 'hot' | 'new' | 'top';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
