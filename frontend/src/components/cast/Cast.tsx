import type { Movie } from '../../features/movies/types';
import s from './cast.module.css';

type CastProps = {
  movie: Movie;
};

const Cast = ({ movie }: CastProps) => {
  const actors = (movie.persons ?? []).filter((p) => p.profession === 'актеры');

  return (
    <>
      <section className={s.cast}>
        <h3 className={s.castHead}>В главных ролях</h3>
        <ul className={s.castList}>
          {actors.slice(0, 12).map((a, i) => (
            <li key={i}>{a.name}</li>
          ))}
        </ul>
        {actors.length > 0 ? <p className={s.castMore}>и еще {actors.length}</p> : null}
      </section>
    </>
  );
};

export default Cast;
