import { Image, StyleSheet, Text, View } from "react-native";

import { getGenreLabelById } from "../../constants/genres";
import type { SwipeableMovie } from "../../types";

interface SwipeCardProps {
  movie: SwipeableMovie;
}

function getPosterUri(posterPath: string | null): string | null {
  if (!posterPath) {
    return null;
  }

  if (posterPath.startsWith("http")) {
    return posterPath;
  }

  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

export function SwipeCard({ movie }: SwipeCardProps) {
  const posterUri = getPosterUri(movie.posterPath);
  const year = movie.releaseDate?.slice(0, 4) || "N/A";
  const genreLabels = movie.genreIds.slice(0, 3).map((genreId) => getGenreLabelById(genreId));

  return (
    <View style={styles.card}>
      {posterUri ? (
        <Image source={{ uri: posterUri }} style={styles.poster} resizeMode="cover" />
      ) : (
        <View style={styles.posterFallback} />
      )}

      <View style={styles.backdropShade} />

      <View style={styles.content}>
        <Text numberOfLines={2} style={styles.title}>
          {movie.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{year}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>⭐ {movie.voteAverage.toFixed(1)}</Text>
        </View>

        <View style={styles.genreRow}>
          {genreLabels.map((genre, index) => (
            <View key={`${movie.id}-${index}`} style={styles.genreChip}>
              <Text style={styles.genreText}>{genre}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#27272A",
    backgroundColor: "#18181B",
  },
  poster: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  posterFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#27272A",
  },
  backdropShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(9, 9, 11, 0.45)",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  title: {
    color: "#FAFAFA",
    fontSize: 28,
    fontWeight: "800",
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    color: "#D4D4D8",
    fontSize: 14,
    fontWeight: "600",
  },
  metaDot: {
    marginHorizontal: 8,
    color: "#A1A1AA",
    fontSize: 14,
  },
  genreRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  genreChip: {
    marginRight: 8,
    marginBottom: 6,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    backgroundColor: "rgba(24, 24, 27, 0.68)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  genreText: {
    color: "#F4F4F5",
    fontSize: 12,
    fontWeight: "600",
  },
});
