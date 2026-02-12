# ReMovie

Movie/Series swipe recommendation app built with Expo, Expo Router, TypeScript, and NativeWind.

## Phase 1 status

- Navigation shell created (`/`, `/swipe`, `/result`)
- Dark-mode placeholder screens wired
- Base config added for Expo Router + NativeWind + Reanimated

## Phase 2 status

- Domain types added in `types/index.ts`
- Constants/prompts added in `constants/*.ts`
- Gemini service added in `services/gemini.ts` using `@google/generative-ai`
- TMDB service added in `services/tmdb.ts`
- Matching utility added in `utils/matching.ts`
- Recommendation orchestration hook added in `hooks/useMovieRecommendations.ts`

## Environment variables

```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key
EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_key
```

## Notes

- `@google/generative-ai` is declared in `package.json`.
- If your network is blocked, run `npm install` later when network access is available.
