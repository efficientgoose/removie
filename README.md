# Removie - Tinder for Movies

A fun, interactive movie recommendation app that uses Tinder-style swiping to help you discover your next movie to watch. Pick a vibe, swipe through movies, and let the wheel decide!

## Features

- **Tinder-Style Swiping**: Swipe right to like, left to pass on movies
- **Vibe-Based Discovery**: Choose from 4 curated mood categories:
  - **Comfort Food** - Feel-good animations and family films
  - **On Edge** - Thrilling horror and suspense
  - **Brainless Fun** - Quick comedy and action flicks
  - **Big Brain** - Documentaries and historical films
- **Randomizer Wheel**: After swiping, spin to randomly select from your liked movies
- **Beautiful UI**: Netflix-inspired dark theme with smooth animations
- **Game Modes**: Single player and multiplayer (coming soon)

## Tech Stack

- **React 19** with TypeScript
- **Vite** - Lightning-fast build tool
- **Zustand** - Minimal state management with localStorage persistence
- **Framer Motion** - Smooth swipe animations
- **Tailwind CSS** - Modern styling
- **TMDB API** - Movie data from The Movie Database

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- A TMDB API key ([Get one free here](https://www.themoviedb.org/settings/api))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd removie
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

5. Enter your TMDB API key when prompted

## Project Structure

```
removie/
├── src/
│   ├── components/
│   │   ├── ErrorBoundary.tsx    # Error handling component
│   │   └── SwipeCard.tsx        # Tinder-style card with drag physics
│   ├── store/
│   │   └── useGameStore.ts      # Zustand state management
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   ├── App.tsx                  # Main app with view routing
│   └── main.tsx                 # React entry point
├── package.json
└── vite.config.ts
```

## How It Works

1. **Setup**: Provide your TMDB API key (stored locally)
2. **Home**: Select single or multiplayer mode
3. **Vibes**: Choose a mood that matches what you want to watch
4. **Swipe**: Browse 10 curated movies - swipe right to like, left to pass
5. **Spin**: Hit the randomizer wheel to pick from your likes
6. **Winner**: Get your movie recommendation with a direct link to watch

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint

## API Configuration

This app uses the TMDB API to fetch movie data. Your API key is stored in your browser's localStorage and never leaves your device.

## Future Enhancements

- Multiplayer mode with shared swipe sessions
- Custom genre mixing
- Watch history tracking
- Share recommendations with friends
- Integration with streaming services

## License

MIT