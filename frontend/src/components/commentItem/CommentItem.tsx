import s from './commentItem.module.css';
import type { MovieComment } from '../../features/comments/commentApi';
import cn from 'classnames';

type CommentItemProps = {
  comment: MovieComment;
  isOwner: boolean;
  isEditing: boolean;
  editText: string;
  savingEdit: boolean;
  deletingId: number | null;
  onStartEdit: (comment: MovieComment) => void;
  onCancelEdit: () => void;
  onSaveEdit: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  setEditText: (text: string) => void;
};

const MAX_LENGTH = 2000;

const CommentItem = ({
  comment,
  isOwner,
  isEditing,
  editText,
  savingEdit,
  deletingId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  setEditText,
}: CommentItemProps) => {
  return (
    <li className={s.item}>
      <div className={s.itemHead}>
        <span className={s.author}>{comment.authorLogin}</span>
        <span className={s.date}>
          {new Date(comment.createdAt).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          {comment.updatedAt !== comment.createdAt ? ' изменён' : null}
        </span>
      </div>

      {isEditing ? (
        <div className={s.editBox}>
          <textarea
            className={s.textarea}
            value={editText}
            maxLength={MAX_LENGTH}
            disabled={savingEdit}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className={s.formFooter}>
            <span className={s.hint}>
              {editText.length}/{MAX_LENGTH}
            </span>
            <div className={s.itemActions}>
              <button
                type="button"
                className={s.submitBtn}
                disabled={savingEdit}
                onClick={() => onSaveEdit(comment.id)}
              >
                {savingEdit ? 'Сохранение...' : 'Сохранить'}
              </button>
              <button
                type="button"
                className={s.cancelBtn}
                disabled={savingEdit}
                onClick={onCancelEdit}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <p className={s.text}>{comment.text}</p>
          {isOwner ? (
            <div className={s.itemActions}>
              <button
                type="button"
                className={s.actionBtn}
                disabled={deletingId != null}
                onClick={() => onStartEdit(comment)}
              >
                Изменить
              </button>
              <button
                type="button"
                className={cn(s.actionBtn, s.actionBtnDanger)}
                disabled={deletingId === comment.id}
                onClick={() => onDelete(comment.id)}
              >
                {deletingId === comment.id ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          ) : null}
        </>
      )}
    </li>
  );
};

export default CommentItem;
