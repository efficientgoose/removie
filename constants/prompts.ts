import type { GeminiRecommendation, TMDBMovie, UserFilters } from "../types";

const MAX_OVERVIEW_CHARS = 100;

function renderMovieLine(movie: TMDBMovie): string {
  const year = movie.releaseDate?.slice(0, 4) ?? "unknown";
  const summary = movie.overview.length
    ? `${movie.overview.slice(0, MAX_OVERVIEW_CHARS)}...`
    : "No synopsis available.";

  return `- ${movie.title} (${year}): ${summary}`;
}

export function buildInitialSuggestionsPrompt(filters: UserFilters, count = 10): string {
  const vibeLine = filters.vibeDescription?.trim()
    ? `- Vibe/Mood: ${filters.vibeDescription.trim()}`
    : "";

  return `You are a movie recommendation expert. Based on the user's preferences, suggest ${count} diverse movies/series for them to swipe on.

User Preferences:
- Content Type: ${filters.contentType}
- Languages: ${filters.languages.join(", ")}
- Genres: ${filters.genres.join(", ")}
- Year Range: ${filters.yearRange}
${vibeLine}

Requirements:
1. Return EXACTLY ${count} suggestions
2. Make them DIVERSE - vary popularity (mix blockbusters with hidden gems), sub-genres, tones, and decades within the year range
3. All suggestions must be real, well-known movies/series
4. Respect the language filter strictly

Return ONLY a valid JSON array, no other text:
[
  {"title": "Movie Name", "year": 2020, "originalLanguage": "en"},
  ...
]`;
}

export function buildFinalRecommendationPrompt(
  likedMovies: TMDBMovie[],
  dislikedMovies: TMDBMovie[],
  excludedTitles: string[] = [],
): string {
  const likedSection = likedMovies.length
    ? likedMovies.map(renderMovieLine).join("\n")
    : "- None";

  const dislikedSection = dislikedMovies.length
    ? dislikedMovies.map(renderMovieLine).join("\n")
    : "- None";

  const excludedSection = excludedTitles.length
    ? `\nDo not recommend any of these titles either:\n${excludedTitles
        .map((title) => `- ${title}`)
        .join("\n")}\n`
    : "";

  return `You are a movie recommendation expert. Analyze the user's swipe patterns and recommend ONE perfect movie/series for them.

Movies/Series they LIKED (swiped right):
${likedSection}

Movies/Series they DISLIKED (swiped left):
${dislikedSection}
${excludedSection}
Analyze what patterns you see:
- What themes, tones, or elements appear in their likes?
- What are they avoiding based on dislikes?

Now recommend ONE movie/series that:
1. Is NOT in either list above
2. Matches the patterns from their likes
3. Avoids elements from their dislikes
4. Is a real, well-known title

Return ONLY valid JSON, no other text:
{
  "title": "Movie Name",
  "year": 2020,
  "originalLanguage": "en",
  "reason": "One paragraph explaining why this is perfect for them based on their swipes"
}`;
}

export function normalizeRecommendationReason(recommendation: GeminiRecommendation): string {
  return recommendation.reason.trim();
}
