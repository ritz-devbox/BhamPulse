import { CuisineType } from '../domain/enums/cuisine-type.enum';
import { fuzzyMatch } from './fuzzy-match';
import { normalizer } from './normalizer';

const CUISINE_KEYWORDS: Record<CuisineType, string[]> = {
  [CuisineType.American]: ['american', 'burgers', 'diner'],
  [CuisineType.Barbecue]: ['bbq', 'barbecue', 'smokehouse'],
  [CuisineType.Breakfast]: ['brunch', 'breakfast', 'pancake'],
  [CuisineType.British]: ['british', 'pub', 'fish and chips'],
  [CuisineType.Cafe]: ['cafe', 'coffee', 'espresso'],
  [CuisineType.Chinese]: ['chinese', 'szechuan', 'dimsum'],
  [CuisineType.French]: ['french', 'bistro', 'brasserie'],
  [CuisineType.Greek]: ['greek', 'gyro', 'souvlaki'],
  [CuisineType.Indian]: ['indian', 'curry', 'tandoori'],
  [CuisineType.Italian]: ['italian', 'pasta', 'pizza'],
  [CuisineType.Japanese]: ['japanese', 'sushi', 'ramen', 'izakaya'],
  [CuisineType.Mediterranean]: ['mediterranean', 'mezze'],
  [CuisineType.Mexican]: ['mexican', 'taco', 'burrito'],
  [CuisineType.MiddleEastern]: ['middle eastern', 'lebanese', 'shawarma'],
  [CuisineType.Thai]: ['thai', 'pad thai', 'curry'],
  [CuisineType.Vietnamese]: ['vietnamese', 'pho', 'banh mi'],
};

/**
 * Returns the best cuisine guess based on restaurant name and category types.
 */
export function classifyCuisine(
  name: string,
  categories: string[] = []
): CuisineType | null {
  const normalizedCategories = categories.map(normalizer);
  const searchSpace = [
    normalizer(name),
    ...normalizedCategories,
    ...Object.values(CUISINE_KEYWORDS).flat().map(normalizer),
  ];

  let best: { cuisine: CuisineType | null; score: number } = {
    cuisine: null,
    score: 0,
  };

  for (const [cuisine, keywords] of Object.entries(CUISINE_KEYWORDS)) {
    const result = fuzzyMatch(name, keywords, 0.35);
    const categoryHit = normalizedCategories.some((c) =>
      keywords.some((k) => c.includes(normalizer(k)))
    );
    const score = Math.max(
      result.score,
      categoryHit ? 0.6 : 0 // boost if category string mentions it directly
    );

    if (score > best.score) {
      best = { cuisine: cuisine as CuisineType, score };
    }
  }

  return best.score >= 0.35 ? best.cuisine : null;
}
