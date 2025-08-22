import express from 'express';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export default function tmdbRoutes({ token, apiKey } = {}) {
  const router = express.Router();

  function buildUrl(pathname, params = {}) {
    const u = new URL(TMDB_BASE + pathname);
    for (const [k, v] of Object.entries(params)) {
      if (v != null) u.searchParams.set(k, String(v));
    }
    if (apiKey && !token) u.searchParams.set('api_key', apiKey);
    return u;
  }

  async function tmdbGet(pathname, params = {}) {
    const res = await fetch(buildUrl(pathname, params), {
      headers: {
        accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error(`TMDb ${res.status}: ${await res.text()}`);
    return res.json();
  }

  // Defaults de idioma a EN (cámbialos si quieres ES)
  router.get('/trending', async (req, res) => {
    try {
      const media = String(req.query.media ?? 'movie'); // movie|tv|all
      const window = String(req.query.window ?? 'day'); // day|week
      const language = String(req.query.language ?? 'en-US');
      const page = String(req.query.page ?? '1');
      res.json(await tmdbGet(`/trending/${media}/${window}`, { language, page }));
    } catch (err) { res.status(500).json({ error: String(err) }); }
  });

  router.get('/search', async (req, res) => {
    try {
      const query = String(req.query.query ?? '');
      if (!query) return res.status(400).json({ error: 'Missing "query"' });
      const language = String(req.query.language ?? 'en-US');
      const page = String(req.query.page ?? '1');
      res.json(await tmdbGet('/search/movie', { query, language, page, include_adult: 'false' }));
    } catch (err) { res.status(500).json({ error: String(err) }); }
  });

  router.get('/discover', async (req, res) => {
    try {
      const genreId = req.query.genreId;
      if (!genreId) return res.status(400).json({ error: 'Missing "genreId"' });
      const language = String(req.query.language ?? 'en-US');
      const page = String(req.query.page ?? '1');
      res.json(await tmdbGet('/discover/movie', {
        with_genres: String(genreId),
        include_adult: 'false',
        sort_by: 'popularity.desc',
        language,
        page,
      }));
    } catch (err) { res.status(500).json({ error: String(err) }); }
  });

  // 👇 ESTA ruta debe ir DENTRO antes del return
  router.get('/movie/:id', async (req, res) => {
    try {
      const id = String(req.params.id);
      const language = String(req.query.language ?? 'en-US');
      res.json(await tmdbGet(`/movie/${id}`, { language }));
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });

  return router;
}
