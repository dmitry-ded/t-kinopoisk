import { useEffect, useState } from 'react';
import cn from 'classnames';
import { fetchLeaderboard, type LeaderboardSort } from '../../features/movies/leaderboardApi';
import { getMovieById } from '../../features/movies/moviesApi';
import type { Movie } from '../../features/movies/types';
import MovieCard from '../../components/movieCard/MovieCard';
import s from './userRatedPage.module.css';
import { getErrorMessage } from '../../utils/errorHandler';

type RatedMovie = {
  movie: Movie;
  average: number;
  count: number;
};

const UserRatedPage = () => {
  const [sort, setSort] = useState<LeaderboardSort>('desc');
  const [movies, setMovies] = useState<RatedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const entries = await fetchLeaderboard(sort);
        const results = await Promise.allSettled(
          entries.map(async (entry) => {
            const movie = await getMovieById(entry.movieId);
            if (!movie) return null;
            return {
              movie,
              average: entry.average,
              count: entry.count,
            };
          }),
        );

        const loaded = results
          .filter((r): r is PromiseFulfilledResult<RatedMovie | null> => r.status === 'fulfilled')
          .map((r) => r.value)
          .filter((item): item is RatedMovie => item != null);

        if (!cancelled) {
          setMovies(loaded);
        }
      } catch (e) {
        if (!cancelled) {
          setError(getErrorMessage(e));
          setMovies([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [sort]);

  return (
    <div className={s.userRatePage}>
      <div className={s.header}>
        <h1 className={s.title}>Фильмы по рейтингу пользователей</h1>
        <div className={s.sortGroup}>
          <button
            type="button"
            className={cn(s.sortBtn, sort === 'desc' && s.sortBtnActive)}
            onClick={() => setSort('desc')}
            disabled={loading}
          >
            По убыванию
          </button>
          <button
            type="button"
            className={cn(s.sortBtn, sort === 'asc' && s.sortBtnActive)}
            onClick={() => setSort('asc')}
            disabled={loading}
          >
            По возрастанию
          </button>
        </div>
      </div>

      {loading && <p className={s.loading}>Загрузка фильмов...</p>}
      {!loading && error && <p className={s.error}>{error}</p>}
      {!loading && !error && movies.length === 0 && (
        <p className={s.empty}>Пока нет фильмов с оценками пользователей</p>
      )}
      {!loading && !error && movies.length > 0 && (
        <div className={s.cardFilms}>
          {movies.map(({ movie, average, count }) => (
            <MovieCard key={movie.id} movie={movie} userRating={{ average, count }} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRatedPage;
