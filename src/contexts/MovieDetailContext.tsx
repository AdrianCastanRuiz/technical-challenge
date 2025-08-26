import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useParams } from "react-router-dom"; // 👈 en cliente
import type { TmdbMovie } from "../types/TmdbMovie";
import { getMovie } from "../../api/tmdb";
import type { WishItem } from "../types/WishItem";
import type { MovieDetailContextValue } from "../types/MovieDetailContextValue";

const LS_KEY = "wishlist";

const readWishlist = (): WishItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeWishlist = (list: WishItem[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
};

const genreVariant = (genres?: Array<{ id: number; name: string }>) => {
  const ids = new Set((genres ?? []).map((g) => g.id));
  if (ids.has(28)) return "action";
  if (ids.has(35)) return "comedy";
  if (ids.has(18)) return "drama";
  if (ids.has(27)) return "horror";
  if (ids.has(10749)) return "romance";
  if (ids.has(878)) return "scifi";
  if (ids.has(16)) return "animation";
  return "default";
};

export const MovieDetailContext =
  createContext<MovieDetailContextValue | undefined>(undefined);

type ProviderProps = { children: ReactNode };

export const MovieDetailProvider = ({ children }: ProviderProps) => {
  const { id } = useParams();
  const [data, setData] = useState<TmdbMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getMovie(Number(id))
      .then((movie) => setData(movie))
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!data?.id) return;
    const list = readWishlist();
    setInWishlist(list.some((item) => item.id === data.id));
  }, [data?.id]);

  const handleAddToWishList = () => {
    if (!data?.id) return;
    const list = readWishlist();
    if (list.some((it) => it.id === data.id)) {
      setInWishlist(true);
      return;
    }
    const item: WishItem = {
      id: data.id,
      title: (data as any).title ?? (data as any).name ?? "Untitled",
      poster_path: (data as any).poster_path ?? null,
      year: (data as any).release_date
        ? String((data as any).release_date).slice(0, 4)
        : undefined,
    };
    writeWishlist([...list, item]);
    setInWishlist(true);
  };

  const value: MovieDetailContextValue = useMemo(
    () => ({
      data,
      loading,
      error,
      inWishlist,
      genreVariant,
      handleAddToWishList,
    }),
    [data, loading, error, inWishlist]
  );

  return (
    <MovieDetailContext.Provider value={value}>
      {children}
    </MovieDetailContext.Provider>
  );
};

export const useMovieDetail = () => {
  const ctx = useContext(MovieDetailContext);
  if (!ctx)
    throw new Error(
      "useMovieDetail must be used within a MovieDetailProvider"
    );
  return ctx;
};
