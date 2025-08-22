import { useEffect, useState, useRef, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import styles from './Carousel.module.scss';
import Loading from './Loading'; 
import { discoverByGenre, posterUrl } from '../../api/tmdb'; 
import type { TmdbMovie } from '../types/TmdbMovie';

type Props = {
  title: string;
  genreId: number;
  language?: string;
  page?: number;
};

const Carousel = ({ title, genreId, language = 'en-US', page = 1 }: Props) => {
  const [items, setItems] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setIndex(0);
    discoverByGenre(genreId, page, language)
      .then((d) => setItems(d.results ?? []))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [genreId, language, page]);

  const canPrev = index > 0;
  const canNext = index < Math.max(0, items.length - 1);
  const prev = () => canPrev && setIndex((i) => i - 1);
  const next = () => canNext && setIndex((i) => i + 1);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  };

  if (loading) return (
    <section className={styles.block} aria-label={title}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </header>
      <div className={styles.state}>
        <Loading size={32} label={`Loading ${title}…`} />
      </div>
    </section>
  );

  if (error) return (
    <section className={styles.block} aria-label={title}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </header>
      <div className={styles.state}>Error: {error}</div>
    </section>
  );

  if (!items.length) return (
    <section className={styles.block} aria-label={title}>
      <header className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
      </header>
      <div className={styles.state}>No results</div>
    </section>
  );

  const m = items[index];

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
            {index + 1} / {items.length}
          </span>
          <button
            type="button"
            className={styles.navBtn}
            aria-label="Next"
            onClick={next}
            disabled={!canNext}
          >
            ›
          </button>
        </div>
      </header>

      <div
        className={styles.viewer}
        ref={viewerRef}
        tabIndex={0}
        onKeyDown={onKey}
      >
        {m.poster_path ? (
          <img
            className={styles.poster}
            src={posterUrl(m.poster_path, 'w500')}
            alt={m.title ?? m.name ?? 'Poster'}
            loading="lazy"
          />
        ) : (
          <div className={styles.fallback} aria-label="No image">🎬</div>
        )}

        <div className={styles.caption}>
          <h3 className={styles.movieTitle}>{m.title ?? m.name}</h3>
          <Link
            className={styles.detailsBtn}
            to={`/movie/${m.id}`}
            aria-label={`Open details for ${m.title ?? m.name}`}
          >
            See details
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Carousel;
