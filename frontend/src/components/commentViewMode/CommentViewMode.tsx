import cn from 'classnames';
import s from './commentViewMode.module.css';
import type { MovieComment } from '../../features/comments/commentApi';

type CommentViewModeProps = {
  comment: MovieComment;
  isOwner: boolean;
  deletingId: number | null;
  onStartEdit: () => void;
  onDelete: () => void;
};

const CommentViewMode = ({
  comment,
  isOwner,
  deletingId,
  onStartEdit,
  onDelete,
}: CommentViewModeProps) => {
  return (
    <>
      <p className={s.text}>{comment.text}</p>
      {isOwner ? (
        <div className={s.itemActions}>
          <button
            type="button"
            className={s.actionBtn}
            disabled={deletingId != null}
            onClick={onStartEdit}
          >
            Изменить
          </button>
          <button
            type="button"
            className={cn(s.actionBtn, s.actionBtnDanger)}
            disabled={deletingId === comment.id}
            onClick={onDelete}
          >
            {deletingId === comment.id ? 'Удаление...' : 'Удалить'}
          </button>
        </div>
      ) : null}
    </>
  );
};

export default CommentViewMode;
