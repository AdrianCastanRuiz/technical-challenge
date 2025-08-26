import { createContext, useContext, useEffect, useMemo, useState,type ReactNode } from 'react';
import { discoverByGenre } from '../../api/tmdb';
import type { TmdbMovie } from '../types/TmdbMovie';
import type { CarouselContextValue } from '../types/CarouselContextValue';

type CarouselProviderProps = {
  genreId: number;
  language?: string;
  page?: number;      
  pageSize?: number;   
  children: ReactNode;
};



const CarouselContext = createContext<CarouselContextValue | undefined>(undefined);

export function CarouselProvider({
  genreId,
  language = 'en-US',
  page = 1,
  pageSize = 5,
  children,
}: CarouselProviderProps) {
  const [items, setItems] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pageIndex, setPageIndex] = useState(0);

  const [tmdbPage, setTmdbPage] = useState<number>(page);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setItems([]);
    setPageIndex(0);
    setTmdbPage(page);
    setTotalPages(1);

    (async () => {
      try {
        const d = await discoverByGenre(genreId, page, language);
        if (cancelled) return;
        setItems(d.results ?? []);
        setTmdbPage(d.page ?? page);
        setTotalPages(d.total_pages ?? 1);
      } catch (e: any) {
        if (cancelled) return;
        setError(String(e));
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [genreId, language, page]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(items.length / pageSize)),
    [items.length, pageSize]
  );

  const canPrev = pageIndex > 0;
  const canNextLocal = pageIndex < pageCount - 1;
  const hasMoreRemote = tmdbPage < totalPages;
  const canNext = canNextLocal || hasMoreRemote;

  const start = pageIndex * pageSize;
  const visible = items.slice(start, start + pageSize);

  const prev = () => { if (canPrev) setPageIndex(i => i - 1); };

  const next = async () => {
    if (canNextLocal) {
      setPageIndex(i => i + 1);
      return;
    }
    if (!hasMoreRemote || isFetchingMore) return;

    setIsFetchingMore(true);
    try {
      const beforeCount = pageCount;
      const nextPageNum = tmdbPage + 1;
      const d = await discoverByGenre(genreId, nextPageNum, language);
      const newResults = d.results ?? [];
      if (newResults.length) {
        setItems(prevItems => [...prevItems, ...newResults]);
        setTmdbPage(d.page ?? nextPageNum);
        setTotalPages(d.total_pages ?? totalPages);

        const afterCount = Math.max(1, Math.ceil((items.length + newResults.length) / pageSize));
        if (afterCount > beforeCount) setPageIndex(i => i + 1);
      }
    } catch (e: any) {
      setError(String(e));
    } finally {
      setIsFetchingMore(false);
    }
  };

  const value: CarouselContextValue = {
    items, loading, error,
    pageIndex, isFetchingMore,
    canPrev, canNext,
    visible,
    prev, next,
  };

  return <CarouselContext.Provider value={value}>{children}</CarouselContext.Provider>;
}

export function useCarousel() {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error('useCarousel must be used within a CarouselProvider');
  return ctx;
}
