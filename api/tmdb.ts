import type { TmdbMovie } from "../src/types/TmdbMovie";
export async function discoverByGenre(
  genreId: number,
  page = 1,
  language = 'en-US' 
) {
  const r = await fetch(
    `/api/tmdb/discover?genreId=${genreId}&language=${language}&page=${page}`
  );
  if (!r.ok) throw new Error(`TMDb ${r.status}`);
  return r.json() as Promise<{ results: TmdbMovie[] }>;
}

export function posterUrl(
  path: string | null,
  size: 'w342' | 'w500' | 'original' = 'w342'
) {
  return path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
}

export async function getMovie(id: number, language = 'en-US') {
  const r = await fetch(`/api/tmdb/movie/${id}?language=${language}`);
  if (!r.ok) throw new Error(`TMDb ${r.status}`);
  return r.json();
}
