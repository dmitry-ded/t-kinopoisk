import { Link } from 'react-router-dom';
import type { MovieListRequest } from '../../features/movieList/movieListApi';
import s from './modalListPicker.module.css';

type ModalListPickerProps = {
  lists: MovieListRequest[];
  selectedListId: number | null;
  onSelectList: (listId: number) => void;
  saving: boolean;
  onAdd: () => void;
  onClose: () => void;
};

const ModalListPicker = ({
  lists,
  selectedListId,
  onSelectList,
  saving,
  onAdd,
  onClose,
}: ModalListPickerProps) => {
  return (
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
                onChange={() => onSelectList(list.id)}
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
          onClick={() => onAdd()}
        >
          {saving ? 'Добавление...' : 'Добавить'}
        </button>
        <button type="button" className={s.btnGhost} onClick={onClose} disabled={saving}>
          Отмена
        </button>
      </div>
      <Link className={s.createLink} to="/create-list" onClick={onClose}>
        + Новый список
      </Link>
    </>
  );
};

export default ModalListPicker;
