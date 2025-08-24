export type TmdbMovie = {
  id: number;
  title?: string;
  name?: string;                 // por si usas TV o ALL
  poster_path: string | null;
  overview: string;
  release_date?: string;
  vote_average: number;
  genres: {id: number, name: string}[]
  total_pages: number
};
