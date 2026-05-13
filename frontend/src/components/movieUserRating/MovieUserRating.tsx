import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated } from '../../features/auth/authSlice';
import { deleteRating, getRating, setRating } from '../../features/movies/moviesBackendApi';
import s from './movieUserRating.module.css';

type MovieUserRatingProps = {
  movieId: number;
  onRatingChange?: () => void;
};

const MovieUserRating = ({ movieId, onRatingChange }: MovieUserRatingProps) => {
  const isAuth = useAppSelector(selectIsAuthenticated);

  const [userMark, setUserMark] = useState<number | null>(null);
  const [ratingSaving, setRatingSaving] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [ratingEditMode, setRatingEditMode] = useState(true);
  const [ratingMenuShow, setRatingMenuShow] = useState(false);

  useEffect(() => {
    if (!isAuth) return;
    let cancelled = false;

    const loadRating = async () => {
      try {
        const data = await getRating(movieId);
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
  }, [movieId, isAuth]);

  const handleSetRating = useCallback(
    async (n: number) => {
      if (!isAuth) return;

      setRatingSaving(true);
      setRatingError(null);
      try {
        const data = await setRating(movieId, n);
        setUserMark(data.rating);
        setRatingEditMode(false);
        setRatingMenuShow(false);
        onRatingChange?.();
      } catch (e) {
        setRatingError(e instanceof Error ? e.message : 'Ошибка, оценка не сохранена');
      } finally {
        setRatingSaving(false);
      }
    },
    [isAuth, movieId, onRatingChange],
  );

  const handleDeleteRating = useCallback(async () => {
    if (!isAuth) return;
    setRatingSaving(true);
    setRatingError(null);
    setRatingMenuShow(false);
    try {
      await deleteRating(movieId);
      setUserMark(null);
      setRatingEditMode(true);
      onRatingChange?.();
    } catch (e) {
      setRatingError(e instanceof Error ? e.message : 'Не удалось удалить оценку');
    } finally {
      setRatingSaving(false);
    }
  }, [isAuth, movieId, onRatingChange]);

  return (
    <>
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
                    className={cn(s.rateNum, userMark === n ? s.rateNumActive : '')}
                    onClick={() => handleSetRating(n)}
                    disabled={ratingSaving}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className={cn(s.rateCapsuleWrap, ratingMenuShow && s.rateCapsuleWrapMenuOpen)}>
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
                <>
                  <button
                    type="button"
                    className={s.rateMenuBackdrop}
                    onClick={() => setRatingMenuShow(false)}
                  />
                  <div className={s.rateMenu}>
                    <button
                      type="button"
                      className={s.rateMenuItem}
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
                      onClick={() => handleDeleteRating()}
                    >
                      Удалить оценку
                    </button>
                  </div>
                </>
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
    </>
  );
};

export default MovieUserRating;
