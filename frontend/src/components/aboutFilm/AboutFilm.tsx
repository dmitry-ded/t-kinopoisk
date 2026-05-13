import type { Movie } from '../../features/movies/types';
import s from './aboutFilm.module.css';

type AboutFilmProps = {
  movie: Movie;
};

const AboutFilm = ({ movie }: AboutFilmProps) => {
  return (
    <>
      <section className={s.about}>
        <h2 className={s.aboutTitle}>О фильме</h2>
        <dl className={s.meta}>
          {movie.year != null ? (
            <>
              <dt>Год производства</dt>
              <dd>{movie.year}</dd>
            </>
          ) : null}
          {movie.premiere?.world ? (
            <>
              <dt>Премьера в мире</dt>
              <dd>
                {new Date(movie.premiere.world).toLocaleDateString('ru-RU', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </dd>
            </>
          ) : null}
          <dt>Страна</dt>
          <dd>{movie.countries?.map((c) => c.name).join(', ') || '-'}</dd>
          <dt>Жанр</dt>
          <dd>{movie.genres?.map((g) => g.name).join(' • ') || '-'}</dd>
          <dt>Слоган</dt>
          <dd>{movie.slogan ?? '-'}</dd>
          {(movie.persons ?? []).filter((p) => p.profession === 'режиссеры').length > 0 ? (
            <>
              <dt>Режиссёр</dt>
              <dd>
                {(movie.persons ?? [])
                  .filter((p) => p.profession === 'режиссеры')
                  .map((d) => d.name)
                  .join(', ')}
              </dd>
            </>
          ) : null}
          {movie.movieLength != null && movie.movieLength > 0 ? (
            <>
              <dt>Время</dt>
              <dd>{movie.movieLength} мин.</dd>
            </>
          ) : null}
          {movie.budget?.value != null && movie.budget.currency ? (
            <>
              <dt>Бюджет</dt>
              <dd>
                {movie.budget.value.toLocaleString('ru-RU')} {movie.budget.currency}
              </dd>
            </>
          ) : null}
          {movie.fees?.world?.value != null && movie.fees.world.currency ? (
            <>
              <dt>Сборы в мире</dt>
              <dd>
                {movie.fees.world.value.toLocaleString('ru-RU')} {movie.fees.world.currency}
              </dd>
            </>
          ) : null}
          {movie.ageRating != null ? (
            <>
              <dt>Возрастное ограничение</dt>
              <dd>
                <span className={s.subline}>
                  <span>{movie.ageRating}+</span>
                </span>
              </dd>
            </>
          ) : null}
        </dl>
      </section>
    </>
  );
};

export default AboutFilm;
