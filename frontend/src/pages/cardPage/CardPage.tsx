import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMovieById } from '../../features/movies/moviesApi';
import FavoriteButton from '../../components/favoriteButton/FavoriteButton';
import MovieUserRating from '../../components/movieUserRating/MovieUserRating';
import s from './cardPage.module.css';
import cn from 'classnames';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { getRatingStats, type RatingStatsResponse } from '../../features/movies/moviesBackendApi';
import type { Movie } from '../../features/movies/types';
import AboutFilm from '../../components/aboutFilm/AboutFilm';
import Cast from '../../components/cast/Cast';
import ModalAddMovie from '../../components/modalAddMovie/ModalAddMovie';

const CardPage = () => {
  const { movieId } = useParams<{ movieId: string }>();

  const resId = movieId != null ? Number(movieId) : NaN;
  const isValidId = Number.isFinite(resId);

  const isAuth = useAppSelector(selectIsAuthenticated);

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingStats, setRatingStats] = useState<RatingStatsResponse | null>(null);
  const [listModalOpen, setListModalOpen] = useState(false);

  useEffect(() => {
    if (!isValidId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMovieById(resId);
        if (cancelled) return;
        if (!data) {
          setMovie(null);
          setError('Фильм не найден');
        } else {
          setMovie(data);
        }
      } catch {
        if (!cancelled) {
          setMovie(null);
          setError('Не удалось загрузить');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [movieId, resId]);

  const loadRatingStats = useCallback(async () => {
    if (!isValidId) return;
    try {
      const stats = await getRatingStats(resId);
      setRatingStats(stats);
    } catch {
      setRatingStats(null);
    }
  }, [resId, isValidId]);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      if (!isValidId) return;
      try {
        const stats = await getRatingStats(resId);
        if (!cancelled) setRatingStats(stats);
      } catch {
        if (!cancelled) setRatingStats(null);
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [resId, isValidId]);

  if (!isValidId) {
    return (
      <div className={s.cardPage}>
        <Link className={s.back} to="/">
          ← На главную
        </Link>
        <p className={cn(s.state, s.error)}>Некорректный id</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={s.cardPage}>
        <p className={s.state}>Загрузка...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={s.cardPage}>
        <Link className={s.back} to="/">
          ← На главную
        </Link>
        <p className={cn(s.state, s.error)}>{error ?? 'Нет данных'}</p>
      </div>
    );
  }

  return (
    <div className={s.cardPage}>
      <Link className={s.back} to="/">
        ← На главную
      </Link>

      <div className={s.grid}>
        <aside className={s.left}>
          <div className={s.posterWrap}>
            <div className={s.poster}>
              {movie.poster?.previewUrl || movie.poster?.url ? (
                <img src={movie.poster.previewUrl ?? movie.poster.url ?? ''} alt="" />
              ) : null}
            </div>
          </div>

          {isAuth ? (
            <button type="button" className={s.sideBtn} onClick={() => setListModalOpen(true)}>
              Добавить в папку
            </button>
          ) : (
            <Link className={s.rateGuestLink} to="/login">
              Войдите в аккаунт.
            </Link>
          )}
        </aside>

        <div className={s.center}>
          <h1 className={s.title}>
            {movie.year != null
              ? `${movie.name ?? 'Без названия'} (фильм ${movie.year})`
              : (movie.name ?? 'Без названия')}
          </h1>
          <p className={s.subline}>{movie.alternativeName ?? '-'}</p>
          <p className={s.lead}>{movie.shortDescription}</p>

          {isAuth ? (
            <div className={s.actions}>
              {movie.id != null ? <FavoriteButton movieId={movie.id} /> : null}
            </div>
          ) : (
            <Link className={s.rateGuestLink} to="/login">
              Войдите в аккаунт.
            </Link>
          )}

          <AboutFilm movie={movie} />
        </div>

        <aside className={s.right}>
          <div className={s.ratingBlock}>
            {movie.rating?.kp != null ? (
              <p className={s.kpBig}>{Math.round(movie.rating.kp * 10) / 10}</p>
            ) : null}
            {movie.votes?.kp != null ? (
              <p className={s.kpHint}>
                {movie.votes.kp.toLocaleString('ru-RU')} оценок (рейтинг API)
              </p>
            ) : null}
            {ratingStats != null && ratingStats.count > 0 ? (
              <p className={s.kpSiteStats}>
                Оценка от пользователей сайта: <strong>{ratingStats.average ?? '-'}</strong> оценок:{' '}
                {ratingStats.count}
              </p>
            ) : ratingStats != null && ratingStats.count === 0 ? (
              <p className={s.kpSiteStatsMuted}>Оценок от пользователей сайта пока нет</p>
            ) : null}
          </div>

          <MovieUserRating movieId={resId} onRatingChange={loadRatingStats} />

          <Cast movie={movie} />
        </aside>
      </div>

      <ModalAddMovie
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        movieId={movie.id ?? resId}
      />
    </div>
  );
};

export default CardPage;
