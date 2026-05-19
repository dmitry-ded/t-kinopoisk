import { Link, useParams } from 'react-router-dom';
import s from './allListMovies.module.css';
import { useEffect, useState } from 'react';
import cn from 'classnames';
import {
  getMovieList,
  removeMovieFromList,
  type MovieListDetail,
} from '../../features/movieList/movieListApi';
import { getMovieById } from '../../features/movies/moviesApi';
import type { Movie } from '../../features/movies/types';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import MovieListItem from '../../components/movieListItem/MovieListItem';
import { getErrorMessage } from '../../utils/errorHandler';

const AllListMovies = () => {
  const { listId: listIdParam } = useParams<{ listId: string }>();

  const currentUser = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<MovieListDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [moviesById, setMoviesById] = useState<Record<number, Movie>>({});
  const [moviesLoading, setMoviesLoading] = useState(false);
  const [removingMovieId, setRemovingMovieId] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const id = listIdParam != null ? Number(listIdParam) : NaN;
  const isValidId = Number.isFinite(id) && id > 0;

  const isOwner = isAuthenticated && list && currentUser?.id === list.userId;

  useEffect(() => {
    if (!isValidId) return;

    let cancelled = false;

    const loadList = async () => {
      setLoading(true);
      setLoadError(null);
      setMoviesById({});
      setMoviesLoading(false);
      try {
        const res = await getMovieList(id);
        if (!cancelled) {
          setList(res);
          if (res.items.length === 0) {
            setMoviesById({});
            setMoviesLoading(false);
          } else {
            setMoviesLoading(true);
            try {
              const entries = await Promise.all(
                res.items.map(async (item) => {
                  const movie = await getMovieById(item.movieId);
                  return [item.movieId, movie] as const;
                }),
              );
              if (cancelled) return;
              const next: Record<number, Movie> = {};
              for (const [movieId, movie] of entries) {
                if (movie) next[movieId] = movie;
              }
              setMoviesById(next);
            } finally {
              if (!cancelled) setMoviesLoading(false);
            }
          }
        }
      } catch (e) {
        if (!cancelled) {
          setList(null);
          setMoviesById({});
          setMoviesLoading(false);
          setLoadError(getErrorMessage(e));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadList();
    return () => {
      cancelled = true;
    };
  }, [listIdParam, isValidId, id]);

  const handleRemoveMovie = async (movieId: number) => {
    setRemoveError(null);
    setRemovingMovieId(movieId);
    try {
      await removeMovieFromList(id, movieId);
      setList((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((item) => item.movieId !== movieId),
            }
          : null,
      );
      setMoviesById((prev) => {
        const next = { ...prev };
        delete next[movieId];
        return next;
      });
    } catch (e) {
      setRemoveError(e instanceof Error ? e.message : 'Не удалось удалить фильм из списка');
    } finally {
      setRemovingMovieId(null);
    }
  };

  if (!isValidId) {
    return (
      <div className={s.allListPage}>
        <Link className={s.back} to={isAuthenticated ? '/profile' : '/'}>
          ← {isAuthenticated ? 'К профилю' : 'На главную'}
        </Link>
        <div className={s.errorBanner}>Некорректный id списка</div>
      </div>
    );
  }

  return (
    <div className={s.allListPage}>
      <Link className={s.back} to={isAuthenticated ? '/profile' : '/'}>
        ← {isAuthenticated ? 'К профилю' : 'На главную'}
      </Link>

      {loading ? (
        <p className={s.loadingState}>Загрузка списка...</p>
      ) : loadError ? (
        <div className={s.errorBanner}>{loadError}</div>
      ) : list ? (
        <>
          <header className={s.header}>
            <div className={s.titleRow}>
              <h1 className={s.title}>{list.title}</h1>
              <span className={cn(s.badge, list.isPublic ? s.badgePublic : s.badgePrivate)}>
                {list.isPublic ? 'Публичный' : 'Приватный'}
              </span>
            </div>
            Создан:{' '}
            {new Date(list.createdAt).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            {list.description ? (
              <p className={s.description}>{list.description}</p>
            ) : (
              <p className={s.descriptionMuted}>Описания нет</p>
            )}
          </header>

          <h2 className={s.sectionTitle}>
            Фильмы в списке <span className={s.count}>(фильмов: {list.items.length})</span>
          </h2>

          {list.items.length > 0 && moviesLoading ? (
            <p className={s.moviesMetaLoading}>Загружаем постеры и названия...</p>
          ) : null}

          {list.items.length === 0 ? (
            <p className={s.emptyMovies}>
              {isOwner
                ? 'В этом списке пока нет фильмов. Добавь их с карточки фильма.'
                : 'В этом списке пока нет фильмов.'}
            </p>
          ) : (
            <ul className={s.list}>
              {list.items.map((m) => (
                <MovieListItem
                  key={m.movieId}
                  movie={moviesById[m.movieId]}
                  movieId={m.movieId}
                  isOwner={isOwner}
                  isRemoving={removingMovieId === m.movieId}
                  onRemove={handleRemoveMovie}
                />
              ))}
            </ul>
          )}
          {removeError && <div className={s.errorBanner}>{removeError}</div>}
        </>
      ) : null}
    </div>
  );
};

export default AllListMovies;
