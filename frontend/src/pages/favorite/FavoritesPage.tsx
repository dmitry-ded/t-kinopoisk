import { useEffect, useState } from 'react';
import { listFavorite } from '../../features/movies/moviesBackendApi';
import { getMovieById } from '../../features/movies/moviesApi';
import s from './favoritesPage.module.css';
import { Link } from 'react-router-dom';

type MovieCard = {
  id: number;
  name?: string;
  alternativeName?: string | null;
  year?: number;
  movieLength?: number;
  ageRating?: number;
  countries?: { name?: string }[];
  genres?: { name?: string }[];
  rating?: { kp?: number };
  poster?: { previewUrl?: string; url?: string };
  shortDescription?: string;
};

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<MovieCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      setLoading(true);
      try {
        const res = await listFavorite();
        const movies = await Promise.allSettled(res.map((el) => getMovieById(el.movieId)));
        const loadedMovies = movies
          .filter((r): r is PromiseFulfilledResult<MovieCard> => r.status === 'fulfilled')
          .map((r) => r.value);
        setFavorites(loadedMovies);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, []);

  if (loading) {
    return (
      <div className={s.page}>
        <div className={s.state}>Загрузка избранного...</div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className={s.page}>
        <header className={s.header}>
          <h1 className={s.title}>Избранное</h1>
          <p className={s.subtitle}>Здесь появятся фильмы, которые вы сохраните</p>
        </header>
        <div className={s.state}>Пока пусто - добавьте фильмы в избранное</div>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <header className={s.header}>
        <h1 className={s.title}>Избранное</h1>
        <p className={s.subtitle}>В списке: {favorites.length}</p>
      </header>

      <div className={s.grid}>
        {favorites.map((movie) => (
          <Link to={`/card/${movie.id}`} key={movie.id} className={s.goToCard}>
            <div className={s.card}>
              <div className={s.posterWrap}>
                {movie.poster?.previewUrl || movie.poster?.url ? (
                  <img
                    className={s.poster}
                    src={movie.poster.previewUrl ?? movie.poster.url ?? ''}
                    alt=""
                  />
                ) : (
                  <div className={s.poster} />
                )}
                {movie.rating?.kp != null && (
                  <span className={s.ratingBadge}>{Math.round(movie.rating.kp * 10) / 10}</span>
                )}
              </div>

              <div className={s.body}>
                <div className={s.titleRow}>
                  <h2 className={s.name}>{movie.name ?? 'Без названия'}</h2>
                  {movie.ageRating != null && (
                    <span className={s.ageBadge}>{movie.ageRating}+</span>
                  )}
                </div>
                {movie.alternativeName && <p className={s.nameEn}>{movie.alternativeName}</p>}

                <div className={s.metaRow}>
                  {movie.year != null && <span className={s.metaItem}>{movie.year}</span>}
                  {movie.movieLength !== undefined && movie.movieLength > 0 && (
                    <>
                      <span className={s.metaDot}>•</span>
                      <span className={s.metaItem}>{movie.movieLength} мин.</span>
                    </>
                  )}
                  {movie.countries?.some((c) => c.name) && (
                    <>
                      <span className={s.metaDot}>•</span>
                      <span className={s.metaItem}>
                        {movie.countries
                          .filter((c) => c.name)
                          .map((c) => c.name)
                          .join(', ')}
                      </span>
                    </>
                  )}
                </div>

                {movie.genres?.some((g) => g.name) && (
                  <div className={s.genres}>
                    {movie.genres
                      .filter((g) => g.name)
                      .map((g) => g.name)
                      .join(' • ')}
                  </div>
                )}

                {movie.shortDescription && (
                  <p className={s.description}>{movie.shortDescription}</p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default FavoritesPage;
