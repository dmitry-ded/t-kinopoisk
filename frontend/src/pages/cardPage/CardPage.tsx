import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMovieById } from '../../features/movies/moviesApi';
import FavoriteButton from '../../components/favoriteButton/FavoriteButton';
import s from './cardPage.module.css';
import cn from 'classnames';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import {
  deleteRatingRequest,
  getRatingOrNull,
  getRatingStatsRequest,
  setRatingRequest,
  type RatingStatsResponse,
} from '../../features/movies/moviesBackendApi';

type Movie = {
  id?: number;
  name?: string;
  alternativeName?: string | null;
  year?: number;
  ageRating?: number;
  shortDescription?: string;
  description?: string;
  slogan?: string | null;
  movieLength?: number;
  countries?: { name?: string }[];
  genres?: { name?: string }[];
  persons?: { name?: string; profession?: string }[];
  rating?: { kp?: number };
  votes?: { kp?: number };
  poster?: { previewUrl?: string; url?: string };
  premiere?: { world?: string };
  fees?: { world?: { value?: number; currency?: string } };
  budget?: { value?: number; currency?: string };
  top250?: number | null;
  externalId?: { imdb?: string | null };
};

const CardPage = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userMark, setUserMark] = useState<number | null>(null);
  const resId = movieId != null ? Number(movieId) : NaN;
  const isValidId = Number.isFinite(resId);
  const isAuth = useAppSelector(selectIsAuthenticated);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingEditMode, setRatingEditMode] = useState(true);
  const [ratingMenuShow, setRatingMenuShow] = useState(false);
  const ratingMenuRef = useRef<HTMLDivElement>(null);
  const [ratingStats, setRatingStats] = useState<RatingStatsResponse | null>(null);

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

  useEffect(() => {
    if (!isValidId) return;

    if (!isAuth) {
      return;
    }
    let cancelled = false;

    const loadRating = async () => {
      try {
        const data = await getRatingOrNull(resId);
        if (cancelled) return;
        const r = data?.rating ?? null;
        setUserMark(r);
        setRatingEditMode(r == null);
        setRatingMenuShow(false);
      } catch {
        if (!cancelled) {
          setUserMark(null);
          setRatingEditMode(true);
          setRatingMenuShow(false);
        }
      }
    };

    loadRating();
    return () => {
      cancelled = true;
    };
  }, [movieId, resId, isAuth]);

  useEffect(() => {
    if (!ratingMenuShow) return;
    const onDown = (e: MouseEvent) => {
      const el = ratingMenuRef.current;
      if (el && !el.contains(e.target as Node)) {
        setRatingMenuShow(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [ratingMenuShow]);

  useEffect(() => {
    if (!isValidId) return;
    let cancelled = false;

    const load = async () => {
      try {
        const s = await getRatingStatsRequest(resId);
        if (!cancelled) setRatingStats(s);
      } catch {
        if (!cancelled) setRatingStats(null);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [movieId, resId, isValidId]);

  const handleSetRating = async (n: number) => {
    if (!isAuth) return;

    setRatingSaving(true);
    setRatingError(null);
    try {
      const data = await setRatingRequest(resId, n);
      setUserMark(data.rating);
      setRatingEditMode(false);
      setRatingMenuShow(false);
      const s = await getRatingStatsRequest(resId);
      setRatingStats(s);
    } catch (e) {
      setRatingError(e instanceof Error ? e.message : 'Ошибка, оценка не сохранена');
    } finally {
      setRatingSaving(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!isAuth) return;
    setRatingSaving(true);
    setRatingError(null);
    setRatingMenuShow(false);
    try {
      await deleteRatingRequest(resId);
      setUserMark(null);
      setRatingEditMode(true);
      const s = await getRatingStatsRequest(resId);
      setRatingStats(s);
    } catch (e) {
      setRatingError(e instanceof Error ? e.message : 'Не удалось удалить оценку');
    } finally {
      setRatingSaving(false);
    }
  };

  console.log(movie);

  if (!isValidId) {
    return (
      <div className={s.page}>
        <Link className={s.back} to="/">
          ← На главную
        </Link>
        <p className={cn(s.state, s.error)}>Некорректный id</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={s.page}>
        <p className={s.state}>Загрузка...</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className={s.page}>
        <Link className={s.back} to="/">
          ← На главную
        </Link>
        <p className={cn(s.state, s.error)}>{error ?? 'Нет данных'}</p>
      </div>
    );
  }

  const actors = (movie.persons ?? []).filter((p) => p.profession === 'актеры');

  return (
    <div className={s.page}>
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

          <button type="button" className={s.sideBtn}>
            Добавить в папку
          </button>
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

          <section className={s.about}>
            <h2 className={s.aboutTitle}>О фильме</h2>
            <dl className={s.meta}>
              {movie.year != null ? (
                <>
                  <dt>Год производства</dt>
                  <dd>{movie.year}</dd>
                </>
              ) : null}
              {movie.premiere?.world ? (
                <>
                  <dt>Премьера в мире</dt>
                  <dd>
                    {new Date(movie.premiere.world).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </dd>
                </>
              ) : null}
              <dt>Страна</dt>
              <dd>{movie.countries?.map((c) => c.name).join(', ') || '-'}</dd>
              <dt>Жанр</dt>
              <dd>{movie.genres?.map((g) => g.name).join(' • ') || '-'}</dd>
              <dt>Слоган</dt>
              <dd>{movie.slogan ?? '-'}</dd>
              {(movie.persons ?? []).filter((p) => p.profession === 'режиссеры').length > 0 ? (
                <>
                  <dt>Режиссёр</dt>
                  <dd>
                    {(movie.persons ?? [])
                      .filter((p) => p.profession === 'режиссеры')
                      .map((d) => d.name)
                      .join(', ')}
                  </dd>
                </>
              ) : null}
              {movie.movieLength != null && movie.movieLength > 0 ? (
                <>
                  <dt>Время</dt>
                  <dd>{movie.movieLength} мин.</dd>
                </>
              ) : null}
              {movie.budget?.value != null && movie.budget.currency ? (
                <>
                  <dt>Бюджет</dt>
                  <dd>
                    {movie.budget.value.toLocaleString('ru-RU')} {movie.budget.currency}
                  </dd>
                </>
              ) : null}
              {movie.fees?.world?.value != null && movie.fees.world.currency ? (
                <>
                  <dt>Сборы в мире</dt>
                  <dd>
                    {movie.fees.world.value.toLocaleString('ru-RU')} {movie.fees.world.currency}
                  </dd>
                </>
              ) : null}
              {movie.ageRating != null ? (
                <>
                  <dt>Возрастное ограничение</dt>
                  <dd>
                    <span className={s.subline}>
                      <span>{movie.ageRating}+</span>
                    </span>
                  </dd>
                </>
              ) : null}
            </dl>
          </section>
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

          {isAuth ? (
            <div className={s.rateWidget}>
              {ratingEditMode || userMark == null ? (
                <>
                  <p className={s.rateLabel}>Оценить фильм</p>
                  <div className={s.rateRow}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={cn(s.rateNum, isAuth && userMark === n ? s.rateNumActive : '')}
                        onClick={() => handleSetRating(n)}
                        disabled={ratingSaving}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className={s.rateCapsuleWrap} ref={ratingMenuRef}>
                  <button
                    type="button"
                    className={s.rateCapsuleBtn}
                    onClick={() => setRatingMenuShow((v) => !v)}
                    disabled={ratingSaving}
                  >
                    <span className={s.rateCapsuleLabel}>Изменить оценку</span>
                    <span className={s.rateCapsuleBadge}>{userMark}</span>
                  </button>
                  {ratingMenuShow ? (
                    <div className={s.rateMenu} role="menu">
                      <button
                        type="button"
                        className={s.rateMenuItem}
                        role="menuitem"
                        onClick={() => {
                          setRatingEditMode(true);
                          setRatingMenuShow(false);
                        }}
                      >
                        Изменить оценку
                      </button>
                      <button
                        type="button"
                        className={s.rateMenuItem}
                        role="menuitem"
                        onClick={() => handleDeleteRating()}
                      >
                        Удалить оценку
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {ratingError ? <p className={s.rateError}>{ratingError}</p> : null}
            </div>
          ) : (
            <div className={s.rateGuest}>
              <p className={s.rateGuestTitle}>Оценка</p>
              <p className={s.rateGuestText}>
                <Link className={s.rateGuestLink} to="/login">
                  Войдите в аккаунт.
                </Link>
              </p>
            </div>
          )}

          <section className={s.cast}>
            <h3 className={s.castHead}>В главных ролях</h3>
            <ul className={s.castList}>
              {actors.slice(0, 12).map((a, i) => (
                <li key={i}>{a.name}</li>
              ))}
            </ul>
            {actors.length > 0 ? <p className={s.castMore}>и еще {actors.length}</p> : null}
          </section>
        </aside>
      </div>
    </div>
  );
};

export default CardPage;
