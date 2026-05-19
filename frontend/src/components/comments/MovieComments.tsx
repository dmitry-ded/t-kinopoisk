import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import {
  createMovieComment,
  deleteMovieComment,
  listMovieComments,
  updateMovieComment,
  type MovieComment,
} from '../../features/comments/commentApi';
import s from './movieComments.module.css';
import CommentItem from '../commentItem/CommentItem';
import { getErrorMessage } from '../../utils/errorHandler';

const MAX_LENGTH = 2000;

type MovieCommentsProps = {
  movieId: number;
};

const MovieComments = ({ movieId }: MovieCommentsProps) => {
  const isAuth = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectUser);

  const [comments, setComments] = useState<MovieComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [comm, setComm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editComm, setEditComm] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const data = await listMovieComments(movieId);
        if (!cancelled) {
          setComments(data);
        }
      } catch (e) {
        if (!cancelled) {
          setComments([]);
          setLoadError(getErrorMessage(e));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadComments();

    return () => {
      cancelled = true;
    };
  }, [movieId]);

  const handleSubmit = async () => {
    const text = comm.trim();
    if (!text) {
      setFormError('Введите текст комментария');
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const created = await createMovieComment(movieId, text);
      setComments((prev) => [created, ...prev]);
      setComm('');
    } catch (e) {
      setFormError(getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (comment: MovieComment) => {
    setEditingId(comment.id);
    setEditComm(comment.text);
    setFormError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditComm('');
  };

  const handleSaveEdit = async (commentId: number) => {
    const text = editComm.trim();
    if (!text) {
      setFormError('Текст не может быть пустым');
      return;
    }
    setSavingEdit(true);
    setFormError(null);
    try {
      const updated = await updateMovieComment(movieId, commentId, text);
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      cancelEdit();
    } catch (e) {
      setFormError(getErrorMessage(e));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!window.confirm(`Вы уверены, что хотите удалить комментарий?`)) {
      return;
    }

    setDeletingId(commentId);
    setFormError(null);
    try {
      await deleteMovieComment(movieId, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      if (editingId === commentId) cancelEdit();
    } catch (e) {
      setFormError(getErrorMessage(e));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className={s.section}>
      <h2 className={s.title}>Комментарии</h2>
      <p className={s.count}>{loading ? 'Загрузка...' : `Всего: ${comments.length}`}</p>

      {loadError ? <div className={s.errorBanner}>{loadError}</div> : null}
      {formError && !loadError ? <div className={s.errorBanner}>{formError}</div> : null}

      {loading ? (
        <p className={s.loading}>Загружаем комментарии...</p>
      ) : (
        <>
          {!loadError && comments.length === 0 ? (
            <p className={s.empty}>Пока никто не оставил комментарий. Будьте первым.</p>
          ) : null}

          {comments.length > 0 ? (
            <ul className={s.list}>
              {comments.map((comment) => {
                const isOwner = isAuth && currentUser != null && currentUser.id === comment.userId;
                const isEditing = editingId === comment.id;

                return (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    isOwner={isOwner}
                    isEditing={isEditing}
                    editText={editComm}
                    savingEdit={savingEdit}
                    deletingId={deletingId}
                    onStartEdit={startEdit}
                    onCancelEdit={cancelEdit}
                    onSaveEdit={handleSaveEdit}
                    onDelete={handleDelete}
                    setEditText={setEditComm}
                    maxLength={MAX_LENGTH}
                  />
                );
              })}
            </ul>
          ) : null}

          {isAuth ? (
            <form
              className={s.form}
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <textarea
                className={s.textarea}
                placeholder="Напишите комментарий к фильму..."
                value={comm}
                maxLength={MAX_LENGTH}
                disabled={submitting}
                onChange={(e) => setComm(e.target.value)}
              />
              <div className={s.formFooter}>
                <span className={s.hint}>
                  {comm.length}/{MAX_LENGTH}
                </span>
                <button type="submit" className={s.submitBtn} disabled={submitting}>
                  {submitting ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </form>
          ) : (
            <p className={s.formGuest}>
              <Link className={s.guestLink} to="/login">
                Войдите в аккаунт
              </Link>
              , чтобы оставить комментарий.
            </p>
          )}
        </>
      )}
    </section>
  );
};

export default MovieComments;
