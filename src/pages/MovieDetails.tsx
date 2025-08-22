import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMovie, posterUrl } from '../../api/tmdb';

export default function MovieDetails() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true); setError(null);
    getMovie(Number(id))
      .then(setData)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading…</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return null;

  return (
    <article style={{ padding: 24, display: 'grid', gridTemplateColumns: '240px 1fr', gap: 16 }}>
      <img
        src={posterUrl(data.poster_path, 'w500')}
        alt={data.title}
        style={{ width: 240, borderRadius: 10 }}
      />
      <div>
        <h1 style={{ marginTop: 0 }}>{data.title}</h1>
        <p>{data.release_date?.slice(0,4)} · ⭐ {data.vote_average?.toFixed?.(1) ?? '—'}</p>
        <p>{data.overview}</p>
      </div>
    </article>
  );
}
