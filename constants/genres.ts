import type { MediaType } from "../types";

export interface GenreOption {
  slug: string;
  label: string;
  movieGenreIds: number[];
  tvGenreIds: number[];
}

export const GENRE_OPTIONS: GenreOption[] = [
  { slug: "thriller", label: "Thriller", movieGenreIds: [53], tvGenreIds: [80, 9648] },
  { slug: "comedy", label: "Comedy", movieGenreIds: [35], tvGenreIds: [35] },
  { slug: "drama", label: "Drama", movieGenreIds: [18], tvGenreIds: [18] },
  { slug: "romance", label: "Romance", movieGenreIds: [10749], tvGenreIds: [18, 10766] },
  { slug: "action", label: "Action", movieGenreIds: [28, 12], tvGenreIds: [10759] },
  { slug: "horror", label: "Horror", movieGenreIds: [27], tvGenreIds: [9648, 10765] },
  { slug: "sci-fi", label: "Sci-Fi", movieGenreIds: [878], tvGenreIds: [10765] },
  { slug: "crime", label: "Crime", movieGenreIds: [80], tvGenreIds: [80] },
  { slug: "adventure", label: "Adventure", movieGenreIds: [12], tvGenreIds: [10759] },
  { slug: "mystery", label: "Mystery", movieGenreIds: [9648], tvGenreIds: [9648] },
  { slug: "fantasy", label: "Fantasy", movieGenreIds: [14], tvGenreIds: [10765] },
  { slug: "animation", label: "Animation", movieGenreIds: [16], tvGenreIds: [16] },
  { slug: "documentary", label: "Documentary", movieGenreIds: [99], tvGenreIds: [99] },
];

export const GENRE_ID_TO_LABEL = GENRE_OPTIONS.reduce<Record<number, string>>((acc, genre) => {
  genre.movieGenreIds.forEach((id) => {
    acc[id] = genre.label;
  });
  genre.tvGenreIds.forEach((id) => {
    acc[id] = genre.label;
  });
  return acc;
}, {});

export function getGenreLabelById(genreId: number): string {
  return GENRE_ID_TO_LABEL[genreId] ?? "Genre";
}

export function mapGenreSlugsToTmdbIds(genreSlugs: string[], mediaType: MediaType): number[] {
  const idSet = new Set<number>();

  for (const slug of genreSlugs) {
    const match = GENRE_OPTIONS.find((genre) => genre.slug === slug);
    if (!match) {
      continue;
    }

    const ids = mediaType === "movie" ? match.movieGenreIds : match.tvGenreIds;
    ids.forEach((id) => idSet.add(id));
  }

  return [...idSet];
}
