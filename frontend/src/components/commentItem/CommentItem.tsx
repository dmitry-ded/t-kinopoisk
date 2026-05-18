import s from './commentItem.module.css';
import type { MovieComment } from '../../features/comments/commentApi';
import CommentEditMode from '../commentEditMode/CommentEditMode';
import CommentViewMode from '../commentViewMode/CommentViewMode';

type CommentItemProps = {
  comment: MovieComment;
  isOwner: boolean;
  isEditing: boolean;
  editText: string;
  savingEdit: boolean;
  deletingId: number | null;
  maxLength: number;
  onStartEdit: (comment: MovieComment) => void;
  onCancelEdit: () => void;
  onSaveEdit: (commentId: number) => void;
  onDelete: (commentId: number) => void;
  setEditText: (text: string) => void;
};

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
  maxLength,
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
        <CommentEditMode
          editText={editText}
          maxLength={maxLength}
          savingEdit={savingEdit}
          onSetEditText={setEditText}
          onSaveEdit={() => onSaveEdit(comment.id)}
          onCancelEdit={onCancelEdit}
        />
      ) : (
        <CommentViewMode
          comment={comment}
          isOwner={isOwner}
          deletingId={deletingId}
          onStartEdit={() => onStartEdit(comment)}
          onDelete={() => onDelete(comment.id)}
        />
      )}
    </li>
  );
};

export default CommentItem;
