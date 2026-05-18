import s from './commentEditMode.module.css';

type CommentEditModeProps = {
  editText: string;
  maxLength: number;
  savingEdit: boolean;
  onSetEditText: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
};

const CommentEditMode = ({
  editText,
  maxLength,
  savingEdit,
  onSetEditText,
  onSaveEdit,
  onCancelEdit,
}: CommentEditModeProps) => {
  return (
    <div className={s.editBox}>
      <textarea
        className={s.textarea}
        value={editText}
        maxLength={maxLength}
        disabled={savingEdit}
        onChange={(e) => onSetEditText(e.target.value)}
      />
      <div className={s.formFooter}>
        <span className={s.hint}>
          {editText.length}/{maxLength}
        </span>
        <div className={s.itemActions}>
          <button
            type="button"
            className={s.submitBtn}
            disabled={savingEdit}
            onClick={onSaveEdit}
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
  );
};

export default CommentEditMode;
