import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './WishList.module.scss';
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
    return <div className={styles.loading}>Loading…</div>;
  }

  if (!items.length) {
    return (
      <section className={styles.emptyWrap}>
        <div className={styles.empty}>
          <p>Your wish list is empty.</p>
          <Link className={styles.cta} to="/">Discover movies</Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Wish list</h1>
        <div className={styles.tools}>
          <span className={styles.count} aria-label={`${items.length} items`}>
            {items.length}
          </span>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={clearAll}
            aria-label="Clear wish list"
          >
            Clear all
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        {items.map((it) => (
          <article key={it.id} className={styles.card}>
            <Link
              to={`/movie/${it.id}`}
              className={styles.posterLink}
              aria-label={`Open ${it.title}`}
            >
              {it.poster_path ? (
                <img
                  className={styles.poster}
                  src={posterUrl(it.poster_path, 'w342')}
                  alt={it.title}
                  loading="lazy"
                />
              ) : (
                <div className={styles.fallback} aria-label="No image">🎬</div>
              )}
            </Link>

            <h3 className={styles.caption} title={it.title}>
              {it.title} {it.year ? <span className={styles.year}>({it.year})</span> : null}
            </h3>

            <button
              type="button"
              className={styles.removeBtn}
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
