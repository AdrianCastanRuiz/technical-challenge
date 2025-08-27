import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './WishList.scss'; 
import { posterUrl } from '../../../api/tmdb';
import { type WishItem } from '../../types/WishItem';

const LS_KEY = 'wishlist';

function readWishlist(): WishItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeWishlist(list: WishItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

export default function WishList() {
  const [items, setItems] = useState<WishItem[] | null>(null);

  useEffect(() => {
    setItems(readWishlist());
  }, []);

  const remove = (id: number) => {
    const next = (items ?? []).filter((it) => it.id !== id);
    writeWishlist(next);
    setItems(next);
  };

  const clearAll = () => {
    writeWishlist([]);
    setItems([]);
  };

  if (items === null) {
    return <div className="wishlist-loading">Loading…</div>;
  }

  if (!items.length) {
    return (
      <section className="wishlist-emptyWrap">
        <div className="wishlist-empty">
          <p>Your wish list is empty.</p>
          <Link className="wishlist-cta" to="/">Discover movies</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="wishlist-container">
      <header className="wishlist-header">
        <h1 className="wishlist-title">Wish list</h1>
        <div className="wishlist-tools">
          <span className="wishlist-count" aria-label={`${items.length} items`}>
            {items.length}
          </span>
          <button
            type="button"
            className="wishlist-clearBtn"
            onClick={clearAll}
            aria-label="Clear wish list"
          >
            Clear all
          </button>
        </div>
      </header>

      <div className="wishlist-grid">
        {items.map((it) => (
          <article key={it.id} className="wishlist-card">
            <Link
              to={`/movie/${it.id}`}
              className="wishlist-posterLink"
              aria-label={`Open ${it.title}`}
            >
              {it.poster_path ? (
                <img
                  className="wishlist-poster"
                  src={posterUrl(it.poster_path, 'w342')}
                  alt={it.title}
                  loading="lazy"
                />
              ) : (
                <div className="wishlist-fallback" aria-label="No image">🎬</div>
              )}
            </Link>

            <h3 className="wishlist-caption" title={it.title}>
              {it.title}{' '}
              {it.year ? <span className="wishlist-year">({it.year})</span> : null}
            </h3>

            <button
              type="button"
              className="wishlist-removeBtn"
              onClick={() => remove(it.id)}
              aria-label={`Remove ${it.title} from wish list`}
            >
              Remove
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
