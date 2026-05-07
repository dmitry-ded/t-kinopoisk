import { Link } from 'react-router-dom';
import s from './footer.module.css';

const Footer = () => {
  return (
    <footer className={s.footer}>
      <div className={s.container}>
        <div className={s.brandBlock}>
          <div className={s.brand}>Т-Кинопоиск</div>
          <p className={s.description}>
            Онлайн-кинотеатр и база фильмов. Смотри, выбирай и сохраняй любимое.
          </p>
        </div>
        <nav className={s.links}>
          <Link to="/" className={s.link}>
            Главная
          </Link>
          <Link to="/login" className={s.link}>
            Войти
          </Link>
          <Link to="/register" className={s.link}>
            Регистрация
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
