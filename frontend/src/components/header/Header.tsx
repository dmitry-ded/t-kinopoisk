import icons from '../../../public/favicon.svg';
import { Link } from 'react-router-dom';
import s from './header.module.css';
import cn from "classnames";

const Header = () => {
  return (
    <header className={s.header}>
        <Link to="/" className={s.logoBtn} aria-label="На главную">
          <img src={icons} alt="" className={s.logo} />
          <span className={s.brand}>Т-Кинопоиск</span>
        </Link>

        <nav className={s.centerNav} aria-label="Основная навигация">
          <Link to="/" className={s.navigate}>
            Главная
          </Link>
          <Link to="/profile/favorites" className={s.navigate}>
            Мое
          </Link>
          <button type="button" className={s.navigate}>
            Поиск
          </button>
        </nav>

        <Link to="/profile" className={cn(s.navigate, s.profileNavigate)}>
          Профиль
        </Link>
    </header>
  );
};

export default Header;
