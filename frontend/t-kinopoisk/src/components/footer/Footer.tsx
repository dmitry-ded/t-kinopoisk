import { Link } from 'react-router-dom';
import styles from './footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brandBlock}>
          <div className={styles.brand}>Т-Кинопоиск</div>
          <p className={styles.description}>
            Онлайн-кинотеатр и база фильмов. Смотри, выбирай и сохраняй любимое.
          </p>
        </div>
        <nav className={styles.links}>
          <Link to="/" className={styles.link}>
            Главная
          </Link>
          <Link to="/login" className={styles.link}>
            Войти
          </Link>
          <Link to="/register" className={styles.link}>
            Регистрация
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
