import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Carousel.module.scss";
import Loading from "./Loading";
import { discoverByGenre, posterUrl } from "../../api/tmdb";
import type { TmdbMovie } from "../types/TmdbMovie";

type CarouselProps = {
  title: string;
  genreId: number;
  language?: string;
  page?: number; // página inicial de TMDB (por defecto 1)
};

const PAGE_SIZE = 5;

const Carousel = ({ title, genreId, language = "en-US", page = 1 }: CarouselProps) => {
  const [items, setItems] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI
  const [pageIndex, setPageIndex] = useState(0);

  // API
  const [tmdbPage, setTmdbPage] = useState<number>(page);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Carga inicial / cuando cambian filtros
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

    return () => {
      cancelled = true;
    };
  }, [genreId, language, page]);

  // Derivados simples
  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(items.length / PAGE_SIZE)),
    [items.length]
  );
  const canPrev = pageIndex > 0;
  const canNextLocal = pageIndex < pageCount - 1;
  const hasMoreRemote = tmdbPage < totalPages;
  const canNext = canNextLocal || hasMoreRemote;

  const start = pageIndex * PAGE_SIZE;
  const visible = items.slice(start, start + PAGE_SIZE);

  const prev = () => {
    if (canPrev) setPageIndex((i) => i - 1);
  };

  const next = async () => {
    if (canNextLocal) {
      setPageIndex((i) => i + 1);
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
        setItems((prev) => [...prev, ...newResults]);
        setTmdbPage(d.page ?? nextPageNum);
        setTotalPages(d.total_pages ?? totalPages);
        // Si al agregar hay una nueva "slide", avanzamos
        const afterCount = Math.max(1, Math.ceil((items.length + newResults.length) / PAGE_SIZE));
        if (afterCount > beforeCount) {
          setPageIndex((i) => i + 1);
        }
      }
    } catch (e: any) {
      setError(String(e));
    } finally {
      setIsFetchingMore(false);
    }
  };

  // UI states
  if (loading) {
    return (
      <section className={styles.block} aria-label={title}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.actions}>
            <Loading size={20} label={`Loading ${title}…`} />
          </div>
        </header>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.block} aria-label={title}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </header>
        <div className={styles.state}>Error: {error}</div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className={styles.block} aria-label={title}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
        </header>
        <div className={styles.state}>No results</div>
      </section>
    );
  }

  return (
    <section className={styles.block} aria-label={title}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.navBtn}
            aria-label="Previous"
            onClick={prev}
            disabled={!canPrev}
          >
            ‹
          </button>

          <span className={styles.progress} aria-live="polite">
            {pageIndex + 1} / {pageCount}
          </span>

          <button
            type="button"
            className={styles.navBtn}
            aria-label="Next"
            onClick={next}
            disabled={!canNext || isFetchingMore}
          >
            ›
          </button>

          {isFetchingMore && (
            <span className={styles.inlineLoader}>
              <Loading size={16} label="Loading more…" />
            </span>
          )}
        </div>
      </header>

      <div className={styles.viewport}>
        <div className={styles.row}>
          {visible.map((m) => (
            <article key={m.id} className={styles.card}>
              <Link
                to={`/movie/${m.id}`}
                className={styles.posterLink}
                aria-label={`Open details for ${m.title ?? m.name}`}
              >
                {m.poster_path ? (
                  <img
                    className={styles.poster}
                    src={posterUrl(m.poster_path, "w342")}
                    alt={m.title ?? m.name ?? "Poster"}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.fallback} aria-label="No image">
                    🎬
                  </div>
                )}
              </Link>

              <h3 className={styles.caption} title={m.title ?? m.name}>
                {m.title ?? m.name}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Carousel;
