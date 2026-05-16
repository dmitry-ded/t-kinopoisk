import { Link } from 'react-router-dom';
import s from './movieCard.module.css';
import type { Movie } from '../../features/movies/types';

type MovieCardProps = {
  movie: Movie;
  userRating?: { average: number; count: number };
};

const MovieCard = ({ movie, userRating }: MovieCardProps) => {
  return (
    <div className={s.card}>
      <Link className={s.cardLink} to={`/card/${movie.id}`}>
        <img className={s.poster} src={movie.poster?.previewUrl ?? ''} alt={movie.name} />
        <strong className={s.rating}>
          {userRating
            ? `${userRating.average} - оценок: ${userRating.count}`
            : movie.rating?.kp != null
              ? `${Math.round(movie.rating.kp * 10) / 10} рейтинг API`
              : '-'}
        </strong>
        <h4 className={s.title}>{movie.name}</h4>
        <p className={s.meta}>
          {movie.year}
          {movie.genres?.length ? `, ${movie.genres.map((g) => g.name).join(', ')}` : ''}
        </p>
      </Link>
    </div>
  );
};

export default MovieCard;
