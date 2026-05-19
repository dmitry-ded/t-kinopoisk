import cn from 'classnames';
import s from './profileListCard.module.css';
import { Link } from 'react-router-dom';

type ProfileListCardProps = {
  id: number;
  title: string;
  itemCount: number;
  isPublic: boolean;
  description: string | null;
  onDelete: (id: number) => void;
};

const ProfileListCard = ({
  id,
  title,
  itemCount,
  isPublic,
  description,
  onDelete,
}: ProfileListCardProps) => {

  const handleDelete = () => {
    if (window.confirm(`Вы уверены, что хотите удалить список: ${title}?`)) {
      onDelete(id);
    }
  };

  return (
    <div className={s.cardWrap}>
      <Link className={s.card} to={`/all-list-movies/${id}`}>
        <h3 className={s.cardTitle}>{title}</h3>
        <div className={s.cardMeta}>
          <span className={s.count}>
            Фильмов: <strong>{itemCount}</strong>
          </span>
          <span className={cn(s.badge, isPublic ? s.badgePublic : s.badgePrivate)}>
            {isPublic ? 'Публичный' : 'Приватный'}
          </span>
        </div>
        <p className={s.cardDesc}>{description ?? ''}</p>
      </Link>
      <button type="button" className={s.cardDeleteBtn} onClick={handleDelete}>
        Удалить список
      </button>
    </div>
  );
};

export default ProfileListCard;
