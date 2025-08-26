# Movie App (Vite + React + TypeScript + SSR + Express)

A small movie browser that shows **three carousels** (Action, Comedy, Drama) using **TMDb** data.  
You can click a movie to see its **details** and add it to a **Wish list** (stored locally in the browser).

> ⚠️ You need **your own TMDb API token** to run this project. See **Configuration** below.

---

## Tech Stack

- **Frontend:** React 19, React Router 6, TypeScript, Vite
- **SSR:** `react-dom/server` + `react-router-dom/server` rendered via **Express**
- **Backend:** Node.js (ESM) + Express, server-side routes proxying TMDb
- **Styling:** SCSS modules + a global stylesheet
- **Data Source:** [The Movie Database (TMDb)](https://www.themoviedb.org/)

---

## Features

- 3 horizontal carousels (Action, Comedy, Drama) with smooth paging buttons
- Movie details page with dynamic styling **by genre**
- “Add to Wish list” (stored in `localStorage`)
- Dedicated Wish list page with remove/clear actions
- Server-side rendering (SSR) in dev and prod
- Small Express API proxy for TMDb (hides your token from the browser)

---

## Requirements

- **Node.js 18+** (required for global `fetch` in Node)
- npm / pnpm / yarn (examples use **npm**)

---

## Getting Started

### 1) Install dependencies
```bash
npm install
```

### 2) Configuration: TMDb token

Create a file **at the project root** named `tmdb.secrets.mjs` and put **your** token there:

```js
// tmdb.secrets.mjs
export const TMDB_TOKEN_V4 = 'PUT_YOUR_TMDB_READ_ACCESS_TOKEN_V4_HERE';
```

- The project uses **Bearer V4** tokens. You can find/generate yours in your TMDb account settings (Read Access Token v4).
- Make sure `tmdb.secrets.mjs` is **ignored by Git**. Your `.gitignore` should contain:
  ```
  tmdb.secrets.mjs
  ```

> If you ever commit a token by mistake, **revoke/rotate** it in TMDb immediately.

### 3) Run in development (SSR with Vite middlewares)
```bash
npm run dev
```
Open `http://localhost:5173`.

### 4) Build for production
Two-step build (client + server):
```bash
npm run build
```

### 5) Preview production (SSR with prebuilt bundles)
```bash
npm run preview
```
Open `http://localhost:5173`.

> You can change the port with `--port=<number>`, e.g.:
> ```
> node server.mjs --prod --port=3000
> ```

---

## Scripts

```json
{
  "dev": "node server.mjs",
  "build:client": "vite build --outDir dist/client --ssrManifest",
  "build:server": "vite build --outDir dist/server --ssr src/entry-server.tsx",
  "build": "npm run build:client && npm run build:server",
  "preview": "node server.mjs --prod",
  "test": "jest",
  "test:watch": "jest --watch",
  "test:ci": "jest --runInBand"
}
```

---

## Project Structure (key files)

```
.
├─ api/
│  └─ tmdb.routes.mjs          # Express router: /api/tmdb/*
├─ src/
│  ├─ entry-client.tsx         # Hydration on the client
│  ├─ entry-server.tsx         # SSR entry (renderToString + StaticRouter)
│  ├─ routes.tsx               # AppRoutes (Browser/StaticRouter wrapper uses this)
│  ├─ pages/
│  │  ├─ Home.tsx              # Shows the 3 carousels
│  │  ├─ MovieDetail/Index.tsx # Details page (uses context, wishlist button)
│  │  └─ WishList/Index.tsx    # Wish list page
│  ├─ components/              # Carousel, Loading, Layout, etc.
│  ├─ contexts/
│  │  └─ MovieDetailContext.tsx# Fetch detail, genre theming, wishlist actions
│  └─ styles/                  # SCSS modules + global.scss (if in /src)
├─ server.mjs                  # Express server (dev + prod)
├─ tmdb.ts                     # Frontend helpers to call the Express API
└─ tmdb.secrets.mjs            # YOUR TMDb token (gitignored)
```

> If your `global.scss` is at the repo root, import it once in `src/entry-client.tsx` (and in SSR entry if needed):
> ```ts
> import '/global.scss';
> ```

---

## How it Works

### SSR Flow
- **Dev:** `server.mjs` starts Vite in middleware mode and `vite.ssrLoadModule('/src/entry-server.tsx')` is used to SSR each request. Client HTML template is transformed via `vite.transformIndexHtml`.
- **Prod:** `vite build` generates:
  - `dist/client` (client assets + `ssr-manifest.json`)
  - `dist/server/entry-server.js` (SSR bundle)
  - `server.mjs` imports the SSR bundle and serves static assets with `compression` + `serve-static`.

### Express API (backend → TMDb)
All browser requests go to **your server**:
- `GET /api/tmdb/discover?genreId=28&language=en-US&page=1`
- `GET /api/tmdb/trending?media=movie&window=day&language=en-US&page=1`
- `GET /api/tmdb/search?query=inception&language=en-US&page=1`
- `GET /api/tmdb/movie/:id?language=en-US`

The server forwards them to TMDb with the `Authorization: Bearer <YOUR_TOKEN>` header and returns JSON.

### Frontend data helpers (`tmdb.ts`)
- `discoverByGenre(genreId, page, language)` → calls `/api/tmdb/discover`
- `getMovie(id, language)` → calls `/api/tmdb/movie/:id`
- `posterUrl(path, size)` → returns `https://image.tmdb.org/t/p/${size}${path}`

### Genre-based theming
On the movie details page we read `data.genres` and map it to a **variant** (`action`, `comedy`, `drama`, etc.).  
The container gets a class like `.g-action` that overrides CSS variables (`--accent`, `--title-font`) to recolor headings and buttons.

---

## Testing

This repo includes **Jest** setup in `package.json`. Run:

```bash
npm test
```

If you prefer Vitest (already listed in `devDependencies`), create a `vitest.config.ts` and use `vitest` instead. Make sure your tests import `MemoryRouter` from **`react-router-dom`** and polyfill `TextEncoder/TextDecoder` in your test setup if needed.

---

## Security Notes

- **Never commit** your TMDb token. Keep `tmdb.secrets.mjs` out of version control (in `.gitignore`).
- If a token gets exposed, **revoke it** in your TMDb account and replace it with a new one.

---

## Troubleshooting

- **Blank page or 500 in dev:** ensure Node 18+ and that `tmdb.secrets.mjs` exists with a valid token.
- **Hydration mismatch:** make sure your client and server render paths are aligned (React Router uses `<BrowserRouter>` on client and `<StaticRouter>` on server; both wrap the same `AppRoutes`).
- **CORS issues:** you should not call TMDb directly from the browser—use the `/api/tmdb/*` proxy provided by the Express server.
- **Language/Genres:** TMDb language defaults to `en-US`. Update query params if you want another locale.

---

## License

MIT (or the license of your choice)
