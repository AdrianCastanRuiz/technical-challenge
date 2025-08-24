import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Carousel.module.scss';
import Loading from './Loading';
import { discoverByGenre, posterUrl } from '../../api/tmdb';
import type { TmdbMovie } from '../types/TmdbMovie';

type CarouselProps = {
  title: string;
  genreId: number;
  language?: string;
  page?: number; // página inicial de TMDB (por defecto 1)
};

const PER_PAGE_UI = 5;

const Carousel = ({ title, genreId, language = 'en-US', page = 1 }: CarouselProps) => {
  const [items, setItems] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);            // carga inicial
  const [error, setError] = useState<string | null>(null);

  // paginación UI (5 por slide)
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(PER_PAGE_UI);
  const [pageCount, setPageCount] = useState(1);

  // paginación API (TMDB)
  const [tmdbPage, setTmdbPage] = useState<number>(page);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState(false); // avanzar tras fetch

  const viewportRef = useRef<HTMLDivElement | null>(null);

  // carga inicial o cuando cambian filtros
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setItems([]);
    setPageIndex(0);
    setTmdbPage(page);
    setTotalPages(1);

    discoverByGenre(genreId, page, language)
      .then((d) => {
        if (cancelled) return;
        setItems(d.results ?? []);
        setTmdbPage(d.page ?? page);
        setTotalPages(d.total_pages ?? 1);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => { cancelled = true; };
  }, [genreId, language, page]);

  // recálculo de páginas UI
  const recalcPagination = () => {
    const perPage = PER_PAGE_UI;
    setPageSize(perPage);
    const pc = Math.max(1, Math.ceil(items.length / perPage));
    setPageCount(pc);
    setPageIndex((pi) => Math.min(pi, pc - 1));
  };
  useEffect(() => { recalcPagination(); }, [items.length]);

  useEffect(() => {
    const onResize = () => recalcPagination();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // si había un avance pendiente tras fetch, avanza cuando ya exista la nueva "página" local
  useEffect(() => {
    if (!pendingAdvance) return;
    const pc = Math.max(1, Math.ceil(items.length / pageSize));
    if (pageIndex < pc - 1) {
      setPageIndex((i) => i + 1);
      setPendingAdvance(false);
    }
  }, [items.length, pageSize, pageIndex, pendingAdvance]);

  const fetchNextApiPage = async () => {
    if (isFetchingMore) return;
    if (tmdbPage >= totalPages) return;

    setIsFetchingMore(true);
    try {
      const nextPage = tmdbPage + 1;
      const d = await discoverByGenre(genreId, nextPage, language);
      setItems((prev) => [...prev, ...(d.results ?? [])]);
      setTmdbPage(d.page ?? nextPage);
      setTotalPages(d.total_pages ?? totalPages);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setIsFetchingMore(false);
    }
  };

  const canPrev = pageIndex > 0;
  const hasMoreRemote = tmdbPage < totalPages;
  const canNextLocal = pageIndex < pageCount - 1;
  const canNext = canNextLocal || hasMoreRemote; // hay siguiente si hay slide local o más en API

  const prev = () => { if (canPrev) setPageIndex((i) => i - 1); };

  const next = async () => {
    if (canNextLocal) {
      setPageIndex((i) => i + 1);
      return;
    }
    // No hay más slides locales, intenta cargar más desde la API
    if (hasMoreRemote) {
      setPendingAdvance(true); // queremos avanzar tras el fetch
      await fetchNextApiPage();
    }
  };

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

  const start = pageIndex * pageSize;
  const visible = items.slice(start, start + pageSize);

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
          >‹</button>

          <span className={styles.progress} aria-live="polite">
            {pageIndex + 1} / {pageCount}
          </span>

          <button
            type="button"
            className={styles.navBtn}
            aria-label="Next"
            onClick={next}
            disabled={!canNext || isFetchingMore}
          >›</button>

          {isFetchingMore && (
            <span className={styles.inlineLoader}>
              <Loading size={16} label="Loading more…" />
            </span>
          )}
        </div>
      </header>

      <div className={styles.viewport} ref={viewportRef}>
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
                    src={posterUrl(m.poster_path, 'w342')}
                    alt={m.title ?? m.name ?? 'Poster'}
                    loading="lazy"
                  />
                ) : (
                  <div className={styles.fallback} aria-label="No image">🎬</div>
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
