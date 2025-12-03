import { Category } from '../domain/enums/category.enum';
import { normalizer } from './normalizer';
import { fuzzyMatch } from './fuzzy-match';

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  [Category.Jobs]: ['hiring', 'job', 'career', 'looking for work', 'internship'],
  [Category.Food]: ['food', 'restaurant', 'dinner', 'lunch', 'pizza', 'burger'],
  [Category.Outdoors]: ['hike', 'trail', 'park', 'outdoors', 'camp'],
  [Category.Bars]: ['bar', 'pub', 'brewery', 'cocktail', 'drinks'],
  [Category.Other]: [],
};

/**
 * Guess a category based on title/flair/content.
 */
export function classifyCategory(title: string, flair?: string | null): Category | null {
  const fields = [title, flair ?? ''].map(normalizer);

  let best: { category: Category | null; score: number } = { category: null, score: 0 };
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (!keywords.length) continue;
    const { score } = fuzzyMatch(fields.join(' '), keywords, 0.2);
    if (score > best.score) {
      best = { category: category as Category, score };
    }
  }

  if (best.score < 0.2) {
    return null;
  }

  return best.category;
}
