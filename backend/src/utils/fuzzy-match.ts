import { normalizer } from './normalizer';

function diceCoefficient(a: string, b: string): number {
  if (!a.length || !b.length) return 0;
  if (a === b) return 1;

  const bigrams = new Map<string, number>();
  for (let i = 0; i < a.length - 1; i++) {
    const gram = a.slice(i, i + 2);
    bigrams.set(gram, (bigrams.get(gram) ?? 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const gram = b.slice(i, i + 2);
    const count = bigrams.get(gram) ?? 0;
    if (count > 0) {
      bigrams.set(gram, count - 1);
      intersection++;
    }
  }

  return (2 * intersection) / (a.length + b.length - 2);
}

export function fuzzyMatch(
  query: string,
  candidates: string[],
  threshold = 0.45
): { match: string | null; score: number } {
  const normalizedQuery = normalizer(query);
  let best: { match: string | null; score: number } = { match: null, score: 0 };

  for (const candidate of candidates) {
    const score = diceCoefficient(normalizedQuery, normalizer(candidate));
    if (score > best.score) {
      best = { match: candidate, score };
    }
  }

  if (best.score < threshold) {
    return { match: null, score: best.score };
  }

  return best;
}
