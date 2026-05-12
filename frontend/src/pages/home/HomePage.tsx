import { useEffect, useState } from 'react';
import s from './homePage.module.css';
import { getMovieById } from '../../features/movies/moviesApi';
import { Link } from 'react-router-dom';

type HomeMovie = {
  id: number;
  name?: string;
  year?: number;
  poster?: { previewUrl?: string; url?: string };
  rating?: { filmCritics?: number };
  genres?: { name: string }[];
};

const HomePage = () => {
  const [movies, setMovies] = useState<HomeMovie[]>([]);

  useEffect(() => {
    const load = async () => {
      const startId = 350;
      const count = 20;
      const ids = Array.from({ length: count }, (_, i) => startId + i);
      const result = await Promise.allSettled(ids.map((id) => getMovieById(id)));
      const loadedMovies = result
        .filter((r): r is PromiseFulfilledResult<HomeMovie> => r.status === 'fulfilled')
        .map((r) => r.value);
      setMovies(loadedMovies);
    };

    load();
  }, []);

  console.log(movies);

  return (
    <div className={s.home}>
      <div className={s.cardFilms}>
        {movies.map((el) => (
          <div key={el.id} className={s.card}>
            <Link className={s.cardLink} to={`/card/${el.id}`}>
              <img className={s.poster} src={el.poster?.previewUrl ?? ''} alt={el.name} />
              <strong className={s.rating}>{el.rating?.filmCritics ?? '-'}</strong>
              <h4 className={s.title}>{el.name}</h4>
              <p className={s.meta}>
                {el.year}
                {el.genres?.length ? `, ${el.genres.map((g) => g.name).join(', ')}` : ''}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;
