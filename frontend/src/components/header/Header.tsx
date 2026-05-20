import { useState } from 'react';
import icons from '../../../public/icon.png';
import { Link } from 'react-router-dom';
import s from './header.module.css';
import cn from 'classnames';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const toggleMenu = () => setMenuOpen((open) => !open);

  return (
    <>
      <header className={s.header}>
        <Link to="/" className={s.logoBtn} onClick={closeMenu}>
          <img src={icons} alt="" className={s.logo} />
          <span className={s.brand}>Т-Кинопоиск</span>
        </Link>

        <nav className={s.desktopNav}>
          <Link to="/" className={s.navigate}>
            Главная
          </Link>
          <Link to="/profile/favorites" className={s.navigate}>
            Мое
          </Link>
          <Link to="/explore/lists" className={s.navigate}>
            Сообщество
          </Link>
          <Link to="/user-rated" className={s.navigate}>
            Рейтинг пользователей
          </Link>
        </nav>

        <div className={s.headerActions}>
          <Link to="/profile" className={cn(s.navigate, s.desktopProfile)}>
            Профиль
          </Link>

          <button type="button" className={s.burger} onClick={toggleMenu}>
            <span className={cn(s.burgerBar, menuOpen && s.burgerBarTop)} />
            <span className={cn(s.burgerBar, menuOpen && s.burgerBarMid)} />
            <span className={cn(s.burgerBar, menuOpen && s.burgerBarBottom)} />
          </button>
        </div>
      </header>

      <div
        className={cn(s.overlay, menuOpen && s.overlayVisible)}
        onClick={closeMenu}
      />

      <aside className={cn(s.drawer, menuOpen && s.drawerOpen)}>
        <div className={s.drawerHead}>
          <span className={s.drawerTitle}>Меню</span>
          <button type="button" className={s.drawerClose} onClick={closeMenu}>
            x
          </button>
        </div>

        <nav className={s.drawerNav}>
          <Link to="/" className={s.navigate} onClick={closeMenu}>
            Главная
          </Link>
          <Link to="/profile/favorites" className={s.navigate} onClick={closeMenu}>
            Мое
          </Link>
          <Link to="/explore/lists" className={s.navigate} onClick={closeMenu}>
            Сообщество
          </Link>
          <Link to="/user-rated" className={s.navigate} onClick={closeMenu}>
            Рейтинг пользователей
          </Link>
          <Link to="/profile" className={s.navigate} onClick={closeMenu}>
            Профиль
          </Link>
        </nav>
      </aside>
    </>
  );
};

export default Header;
