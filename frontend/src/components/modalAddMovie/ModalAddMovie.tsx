import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
  addMovieToList,
  listMyMovieLists,
  type MovieListRequest,
} from '../../features/movieList/movieListApi';
import s from './modalAddMovie.module.css';

export type ModalAddMovieProps = {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
};

const ModalAddMovie = ({ isOpen, onClose, movieId }: ModalAddMovieProps) => {
  const [lists, setLists] = useState<MovieListRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const fetchLists = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);

      try {
        const data = await listMyMovieLists();
        if (!cancelled) {
          setLists(data);
          setSelectedListId(data[0]?.id ?? null);
        }
      } catch (e) {
        if (!cancelled) {
          setLists([]);
          setSelectedListId(null);
          setError(e instanceof Error ? e.message : 'Не удалось загрузить списки');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLists();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const handleAdd = async () => {
    if (selectedListId == null || !Number.isFinite(movieId) || movieId <= 0) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await addMovieToList(selectedListId, movieId);
      setSuccess('Фильм добавлен в список');
      window.setTimeout(() => {
        onClose();
      }, 600);
    } catch (e) {
      if (isAxiosError(e) && e.response?.status === 409) {
        setError('Этот фильм уже есть в выбранном списке');
      } else if (isAxiosError(e) && e.response?.status === 401) {
        setError('Нужно войти в аккаунт');
      } else if (isAxiosError(e) && e.response?.status === 403) {
        setError('Нет доступа. Обновите страницу и войдите снова.');
      } else if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Не удалось добавить в список');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={s.overlay} onClick={onClose}>
      <div className={s.modal} onClick={(e) => e.stopPropagation()}>
        <div className={s.head}>
          <h2 className={s.title}>Добавить в папку</h2>
        </div>

        <div className={s.body}>
          {loading ? (
            <p className={s.loading}>Загрузка списков…</p>
          ) : lists.length === 0 ? (
            <>
              <p className={s.emptyHint}>
                У вас пока нет ни одного списка. Создайте список в профиле.
              </p>
              <Link className={s.createLink} to="/create-list" onClick={onClose}>
                Создать список
              </Link>
            </>
          ) : (
            <>
              <ul className={s.list}>
                {lists.map((list) => (
                  <li key={list.id} className={s.row}>
                    <label className={s.label}>
                      <input
                        type="radio"
                        name="movie-list-pick"
                        className={s.radio}
                        checked={selectedListId === list.id}
                        onChange={() => setSelectedListId(list.id)}
                      />
                      <span className={s.rowText}>
                        <span className={s.rowTitle}>{list.title}</span>
                        <span className={s.rowMeta}>
                          {' '}
                          Фильмов: {list.itemCount}
                          {list.isPublic ? ' публичный' : ' приватный'}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
              <div className={s.actions}>
                <button
                  type="button"
                  className={s.btnPrimary}
                  disabled={saving || selectedListId == null}
                  onClick={() => handleAdd()}
                >
                  {saving ? 'Добавление…' : 'Добавить'}
                </button>
                <button type="button" className={s.btnGhost} onClick={onClose} disabled={saving}>
                  Отмена
                </button>
              </div>
              <Link className={s.createLink} to="/create-list" onClick={onClose}>
                + Новый список
              </Link>
            </>
          )}

          {error ? <p className={s.error}>{error}</p> : null}
          {success ? <p className={s.success}>{success}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default ModalAddMovie;
