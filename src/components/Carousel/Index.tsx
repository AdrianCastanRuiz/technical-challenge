import { Link } from 'react-router-dom';
import './Carousel.scss'; 
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
      <section className="carousel-block" aria-label={title}>
        <header className="carousel-header">
          <h2 className="carousel-title">{title}</h2>
          <div className="carousel-actions">
            <Loading size={20} label={`Loading ${title}…`} />
          </div>
        </header>
      </section>
    );
  }

  if (error) {
    return (
      <section className="carousel-block" aria-label={title}>
        <header className="carousel-header">
          <h2 className="carousel-title">{title}</h2>
        </header>
        <div className="carousel-state">Error: {error}</div>
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="carousel-block" aria-label={title}>
        <header className="carousel-header">
          <h2 className="carousel-title">{title}</h2>
        </header>
        <div className="carousel-state">No results</div>
      </section>
    );
  }

  return (
    <section className="carousel-block" aria-label={title}>
      <header className="carousel-header">
        <h2 className="carousel-title">{title}</h2>
        <div className="carousel-actions">
          <button
            type="button"
            className="carousel-navBtn"
            aria-label="Previous"
            onClick={prev}
            disabled={!canPrev}
          >
            ‹
          </button>

          <button
            type="button"
            className="carousel-navBtn"
            aria-label="Next"
            onClick={next}
            disabled={!canNext || isFetchingMore}
          >
            ›
          </button>

          {isFetchingMore && (
            <span className="carousel-inlineLoader">
              <Loading size={16} label="Loading more…" />
            </span>
          )}
        </div>
      </header>

      <div className="carousel-viewport">
        <div className="carousel-row">
          {visible.map((m) => (
            <article key={m.id} className="carousel-card">
              <Link
                to={`/movie/${m.id}`}
                className="carousel-posterLink"
                aria-label={`Open details for ${m.title ?? m.name}`}
              >
                {m.poster_path ? (
                  <img
                    className="carousel-poster"
                    src={posterUrl(m.poster_path, 'w342')}
                    alt={m.title ?? m.name ?? 'Poster'}
                    loading="lazy"
                  />
                ) : (
                  <div className="carousel-fallback" aria-label="No image">🎬</div>
                )}
              </Link>

              <h3 className="carousel-caption" title={m.title ?? m.name}>
                {m.title ?? m.name}
              </h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
