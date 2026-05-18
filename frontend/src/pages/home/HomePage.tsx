import { useEffect, useState } from 'react';
import s from './homePage.module.css';
import { getMovieById } from '../../features/movies/moviesApi';
import type { Movie } from '../../features/movies/types';
import MovieCard from '../../components/movieCard/MovieCard';

const HomePage = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const startId = 350;
      const count = 20;
      const ids = Array.from({ length: count }, (_, i) => startId + i);
      const result = await Promise.allSettled(ids.map((id) => getMovieById(id)));
      const loadedMovies = result
        .filter((r): r is PromiseFulfilledResult<Movie> => r.status === 'fulfilled')
        .map((r) => r.value)
        .filter((movie) => movie != null && typeof movie.id === 'number');
      setMovies(loadedMovies);
      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return <div className={s.home}>Загрузка фильмов...</div>;
  }

  return (
    <div className={s.home}>
      <div className={s.cardFilms}>
        {movies.map((el) => (
          <MovieCard key={el.id} movie={el} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
