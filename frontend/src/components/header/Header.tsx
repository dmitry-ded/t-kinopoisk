import icons from '../../../public/favicon.svg';
import { Link } from 'react-router-dom';
import styles from './header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
        <Link to="/" className={styles.logoBtn} aria-label="На главную">
          <img src={icons} alt="" className={styles.logo} />
          <span className={styles.brand}>Т-Кинопоиск</span>
        </Link>

        <nav className={styles.centerNav} aria-label="Основная навигация">
          <Link to="/" className={styles.navigate}>
            Главная
          </Link>
          <Link to="/profile/favorites" className={styles.navigate}>
            Мое
          </Link>
          <button type="button" className={styles.navigate}>
            Поиск
          </button>
        </nav>

        <Link to="/profile" className={`${styles.navigate} ${styles.profileNavigate}`}>
          Профиль
        </Link>
    </header>
  );
};

export default Header;
