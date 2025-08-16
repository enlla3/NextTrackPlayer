# NextTrackPlayer (Frontend)

**Live site:** https://nexttrackplayer.onrender.com/
**API base (production):** `https://nexttrack.onrender.com/api`

A **Vite + React** UI for NextTrack. It lets you add seed songs, discover candidates with a “Find Songs” helper, get ranked recommendations, and play the pick via an embedded YouTube player.

## Tech stack

-   React 19 + Vite
-   Tailwind CSS v4
-   axios (API calls)
-   react-youtube (player)
-   react-toastify (UX notifications)
-   Jest + @testing-library/react (component and flow tests)

## What it does (flow)

1. **Seed input** — Enter `{ title, artist }` items as your starting set.
2. **Find Songs** — Search by a single **artist** or **title** (hits `/api/find-tracks`). Results appear in a **SelectionModal** so you can pick which ones to keep.
3. **Recommend** — Sends your seeds (and optional preferences) to `/api/recommend`, then shows a ranked list in **RecommendationList**/**ResultsList**.
4. **Play** — Uses `/api/yt-search` to resolve a `videoId` and renders it with **react-youtube** in **YouTubePlayer**.

## Environment

Create a `.env` file in the project root (Vite picks up `VITE_*`):

```
VITE_API_BASE_URL=https://nexttrack.onrender.com/api
```

> Don’t commit real keys. In production, set these as environment variables before building.

## Scripts

```json
{
	"dev": "vite",
	"build": "vite build",
	"preview": "vite preview",
	"lint": "eslint .",
	"test": "jest --passWithNoTests"
}
```

## Local development

```bash
npm install
npm run dev     # visit the printed local URL
npm test
```

## Key files (short)

-   `src/pages/App.jsx` — top-level page
-   `src/components/TrackForm.jsx` — seed entry
-   `src/components/FindSongsForm.jsx` — start the “find tracks” flow
-   `src/components/SelectionModal.jsx` — choose results from the find flow
-   `src/components/RecommendationList.jsx` & `src/components/ResultsList.jsx` — render ranked results
-   `src/components/YouTubePlayer.jsx` & `src/components/YouTubePlayer_yt.jsx` — embedded playback
-   `src/components/Spinner.jsx`, `src/components/NavBar.jsx` — UI helpers
-   `src/lib/videoCache.js` — memoizes video lookups
-   `src/components/__tests__/…` — RTL/Jest tests (e.g., selection/highlight states, click handlers, error cases)

## How it talks to the backend

-   `axios` points at `VITE_API_BASE_URL`.
-   Calls:
    -   `GET /yt-search?q=<title> <artist>` → embed video
    -   `POST /find-tracks` with `{ artist }` **or** `{ title }` → open SelectionModal
    -   `POST /recommend` with `{ track_ids: [...], preferences?: {...} }` → render ranked list
