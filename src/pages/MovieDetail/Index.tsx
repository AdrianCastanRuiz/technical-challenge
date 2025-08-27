import { posterUrl } from '../../../api/tmdb';
import Loading from '../../components/Loading/Index';
import { useMovieDetail } from '../../contexts/MovieDetailContext';
import './MovieDetails.scss'; 

export default function MovieDetails() {
  const { data, loading, error, inWishlist, genreVariant, handleAddToWishList } =
    useMovieDetail();

  if (loading) {
    return (
      <div className="movieDetails-loading">
        <Loading size={40} label="Loading movie…" />
      </div>
    );
  }

  if (error) return <p className="movieDetails-error">Error: {error}</p>;
  if (!data) return null;

  const variant = genreVariant((data as any).genres);

  return (
    <article className={`movieDetails-container movieDetails-g-${variant}`}>
      <img
        src={posterUrl(data.poster_path, 'w500')}
        alt={data.title}
        className="movieDetails-poster"
      />
      <div>
        <h1 className="movieDetails-title">{data.title}</h1>
        <p className="movieDetails-meta">
          {data.release_date?.slice(0, 4)} · ⭐{' '}
          {data.vote_average?.toFixed?.(1) ?? '—'}
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
          className={`movieDetails-wishBtn ${
            inWishlist ? 'movieDetails-added' : ''
          }`}
        >
          {inWishlist ? 'Added ✓' : 'Add to Wish list'}
        </button>

        <p className="movieDetails-overview">{data.overview}</p>
      </div>
    </article>
  );
}
