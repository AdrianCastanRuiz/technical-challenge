import { Link } from 'react-router-dom';
import styles from './Carousel.module.scss';
import Loading from '../Loading/Index';
import { posterUrl } from '../../../api/tmdb';
import { useCarousel } from '../../contexts/CarouselContext';

type Props = { title: string };

export default function Carousel({ title }: Props) {
  const {
    loading, error, items,
    visible, canPrev, canNext,
    isFetchingMore, prev, next,
  } = useCarousel();

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
          >‹</button>

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

      <div className={styles.viewport}>
        <div className={styles.row}>
          {visible.map(m => (
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
}
