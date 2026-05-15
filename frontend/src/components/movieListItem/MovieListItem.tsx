import type { Movie } from '../../features/movies/types';
import { Link } from 'react-router-dom';
import s from './movieListItem.module.css';

type MovieListItemProps = {
  movie: Movie | undefined;
  movieId: number;
  isOwner: boolean | null;
  isRemoving: boolean;
  onRemove: (movieId: number) => void;
};

const MovieListItem = ({ movie, movieId, isOwner, isRemoving, onRemove }: MovieListItemProps) => {
  const handleDelete = () => {
    if (window.confirm(`Вы уверены, что хотите удалить фильм`)) {
      onRemove(movieId);
    }
  };

  return (
    <li className={s.movieRow}>
      {movie?.poster?.previewUrl || movie?.poster?.url ? (
        <img className={s.posterImg} src={movie.poster.previewUrl ?? movie.poster.url} alt="" />
      ) : (
        <div className={s.poster} />
      )}
      <div className={s.body}>
        <p className={s.movieTitle}>
          {movie?.name ?? movie?.alternativeName ?? `Фильм ${movieId}`}
        </p>
        <p className={s.movieMeta}>
          {movie?.year ?? '-'} {movie?.genres?.map((el) => el.name).join(', ')}
        </p>
      </div>
      <div className={s.rowActions}>
        <Link className={s.link} to={`/card/${movieId}`}>
          Карточка
        </Link>
        {isOwner && (
          <button
            type="button"
            className={s.removeBtn}
            disabled={isRemoving}
            onClick={handleDelete}
          >
            {isRemoving ? 'Удаление...' : 'Удалить из списка'}
          </button>
        )}
      </div>
    </li>
  );
};

export default MovieListItem;
