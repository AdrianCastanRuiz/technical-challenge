import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './MovieDetails.module.scss';
import { getMovie, posterUrl } from '../../../api/tmdb';
import Loading from '../../components/Loading';
import type { WishItem } from '../../types/WishItem';
import type { TmdbMovie } from '../../types/TmdbMovie';


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

function genreVariant(genres?: Array<{ id: number; name: string }>) {
  const ids = new Set((genres ?? []).map(g => g.id));
  if (ids.has(28))   return 'action';     
  if (ids.has(35))   return 'comedy';     
  if (ids.has(18))   return 'drama';     
  if (ids.has(27))   return 'horror';     
  if (ids.has(10749))return 'romance';    
  if (ids.has(878))  return 'scifi';      
  if (ids.has(16))   return 'animation';  
  return 'default';
}

export default function MovieDetails() {
  const { id } = useParams();
  const [data, setData] = useState<TmdbMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inWishlist, setInWishlist] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getMovie(Number(id))
      .then((movie) => setData(movie))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!data?.id) return;
    const list = readWishlist();
    setInWishlist(list.some((it) => it.id === data.id));
  }, [data?.id]);

  const handleAddToWishlist = () => {
    if (!data?.id) return;
    const list = readWishlist();
    if (list.some((it) => it.id === data.id)) {
      setInWishlist(true);
      return;
    }
    const item: WishItem = {
      id: data.id,
      title: data.title ?? data.name ?? 'Untitled',
      poster_path: data.poster_path ?? null,
      year: data.release_date ? String(data.release_date).slice(0, 4) : undefined,
    };
    writeWishlist([...list, item]);
    setInWishlist(true);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loading size={40} label="Loading movie…" />
      </div>
    );
  }

  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (!data) return null;

  const variant = genreVariant(data.genres); 
  console.log("data: ", data)
  return (
    <article className={`${styles.container} ${styles['g-' + variant]}`}>
      <img
        src={posterUrl(data.poster_path, 'w500')}
        alt={data.title}
        className={styles.poster}
      />
      <div>
        <h1 className={styles.title}>{data.title}</h1>
        <p className={styles.meta}>
          {data.release_date?.slice(0, 4)} · ⭐ {data.vote_average?.toFixed?.(1) ?? '—'}
        </p>

        <button
          type="button"
          onClick={handleAddToWishlist}
          disabled={inWishlist}
          aria-pressed={inWishlist}
          aria-label={
            inWishlist
              ? `Already in wish list: ${data.title}`
              : `Add "${data.title}" to wish list`
          }
          className={`${styles.wishBtn} ${inWishlist ? styles.added : ''}`}
        >
          {inWishlist ? 'Added ✓' : 'Add to Wish list'}
        </button>

        <p className={styles.overview}>{data.overview}</p>
      </div>
    </article>
  );
}
