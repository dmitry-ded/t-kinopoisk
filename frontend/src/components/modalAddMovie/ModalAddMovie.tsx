import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addMovieToList,
  listMyMovieLists,
  type MovieListRequest,
} from '../../features/movieList/movieListApi';
import s from './modalAddMovie.module.css';
import ModalListPicker from '../modalListPicker/ModalListPicker';
import { getErrorMessage } from '../../utils/errorHandler';
import cn from 'classnames';

export type ModalAddMovieProps = {
  isOpen: boolean;
  onClose: () => void;
  movieId: number;
};

const MODAL_CLOSE_DELAY = 600;

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
      }, MODAL_CLOSE_DELAY);
    } catch (e) {
      setError(getErrorMessage(e));
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
            <p className={s.loading}>Загрузка списков...</p>
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
            <ModalListPicker
              lists={lists}
              selectedListId={selectedListId}
              onSelectList={setSelectedListId}
              saving={saving}
              onAdd={handleAdd}
              onClose={onClose}
            />
          )}

          {error ? <p className={cn(s.message, s.error)}>{error}</p> : null}
          {success ? <p className={cn(s.message, s.success)}>{success}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default ModalAddMovie;
