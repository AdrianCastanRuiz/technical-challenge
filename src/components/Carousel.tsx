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
  page?: number;
};

const Carousel = ({ title, genreId, language = 'en-US', page = 1 }: CarouselProps) => {
  const [items, setItems] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(7);
  const [pageCount, setPageCount] = useState(1);

  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true)
    setError(null)
    setPageIndex(0)
    discoverByGenre(genreId, page, language)
      .then((d) => {
        setItems(d.results ?? [])
        console.log(d.results)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }, [genreId, language, page])

  const recalcPagination = () => {
    const perPage = 7;
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

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;
  const prev = () => canPrev && setPageIndex((i) => i - 1);
  const next = () => canNext && setPageIndex((i) => i + 1);

  if (loading) {
    return (
      <section className={styles.block} aria-label={title}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <div className={styles.actions}><Loading size={20} label={`Loading ${title}…`} /></div>
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
            disabled={!canNext}
          >›</button>
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
