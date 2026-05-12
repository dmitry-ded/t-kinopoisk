import { useState } from 'react';
import { addFavoriteRequest, removeFavoriteRequest } from '../../features/movies/moviesBackendApi';
import favoriteOutline from '../../assets/Favorite.svg';
import favoriteFill from '../../assets/FavoriteFill.svg';
import s from './favoriteButton.module.css';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  addFavorites,
  removeFavorites,
  selectFavoriteIds,
} from '../../features/movies/favoriteSlice';

type Props = {
  movieId: number;
};

const FavoriteButton = ({ movieId }: Props) => {
  const ids = useAppSelector(selectFavoriteIds);
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFavorite = ids.includes(movieId);

  const handleToggle = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        await dispatch(removeFavorites(movieId));
      } else {
        await dispatch(addFavorites(movieId));
      }
    } catch (e) {
      setError(typeof e === 'string' ? e : 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.wrap}>
      <button
        type="button"
        className={`${s.btn} ${isFavorite ? s.btnActive : ''}`}
        onClick={() => handleToggle()}
        disabled={loading}
      >
        <img
          className={s.icon}
          src={loading ? favoriteOutline : isFavorite ? favoriteFill : favoriteOutline}
          alt=""
          draggable={false}
        />
        <span className={s.label}>
          {loading ? '...' : isFavorite ? 'В избранном' : 'Добавить в избранное'}
        </span>
      </button>
      {error ? <p className={s.error}>{error}</p> : null}
    </div>
  );
};

export default FavoriteButton;
