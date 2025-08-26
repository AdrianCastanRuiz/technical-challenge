import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './MovieDetails.module.scss';
import { getMovie, posterUrl } from '../../../api/tmdb';
import Loading from '../../components/Loading/Index';
import type { WishItem } from '../../types/WishItem';
import type { TmdbMovie } from '../../types/TmdbMovie';
import { useMovieDetail } from '../../contexts/MovieDetailContext';

export default function MovieDetails() {
 
  const { data, loading, error, inWishlist, genreVariant, handleAddToWishList} = useMovieDetail()

  if (loading) {
    return (
      <div className={styles.loading}>
        <Loading size={40} label="Loading movie…" />
      </div>
    );
  }

  if (error) return <p className={styles.error}>Error: {error}</p>;
  if (!data) return null;

  const variant = genreVariant(); 

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
          onClick={handleAddToWishList}
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
