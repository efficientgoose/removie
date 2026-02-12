import type { GeminiMovieSuggestion, TMDBMovie } from "../types";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) {
    return 0;
  }

  if (!a.length) {
    return b.length;
  }

  if (!b.length) {
    return a.length;
  }

  const matrix = Array.from({ length: b.length + 1 }, (_, row) => [row]);

  for (let col = 1; col <= a.length; col += 1) {
    matrix[0][col] = col;
  }

  for (let row = 1; row <= b.length; row += 1) {
    for (let col = 1; col <= a.length; col += 1) {
      const cost = a[col - 1] === b[row - 1] ? 0 : 1;
      matrix[row][col] = Math.min(
        matrix[row - 1][col] + 1,
        matrix[row][col - 1] + 1,
        matrix[row - 1][col - 1] + cost,
      );
    }
  }

  return matrix[b.length][a.length];
}

function titleSimilarity(a: string, b: string): number {
  const left = normalizeTitle(a);
  const right = normalizeTitle(b);

  if (!left || !right) {
    return 0;
  }

  if (left === right) {
    return 1;
  }

  const distance = levenshtein(left, right);
  const maxLength = Math.max(left.length, right.length);

  return maxLength === 0 ? 0 : 1 - distance / maxLength;
}

function yearScore(suggestedYear: number, candidateReleaseDate: string): number {
  const candidateYear = Number(candidateReleaseDate.slice(0, 4));
  if (!Number.isFinite(candidateYear)) {
    return 0;
  }

  const delta = Math.abs(candidateYear - suggestedYear);
  if (delta === 0) {
    return 1;
  }

  if (delta === 1) {
    return 0.7;
  }

  if (delta <= 3) {
    return 0.35;
  }

  return 0;
}

export function getMatchScore(suggestion: GeminiMovieSuggestion, candidate: TMDBMovie): number {
  const titleScore = titleSimilarity(suggestion.title, candidate.title);
  const yearMatchScore = yearScore(suggestion.year, candidate.releaseDate);
  const languageScore =
    suggestion.originalLanguage.toLowerCase() === candidate.originalLanguage.toLowerCase() ? 1 : 0;

  return titleScore * 0.65 + yearMatchScore * 0.25 + languageScore * 0.1;
}

export function findBestTmdbMatch(
  suggestion: GeminiMovieSuggestion,
  candidates: TMDBMovie[],
  minScore = 0.55,
): TMDBMovie | null {
  let best: TMDBMovie | null = null;
  let bestScore = minScore;

  for (const candidate of candidates) {
    const score = getMatchScore(suggestion, candidate);
    if (score > bestScore) {
      best = candidate;
      bestScore = score;
    }
  }

  return best;
}
