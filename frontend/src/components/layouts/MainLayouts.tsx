import Header from '../header/Header';
import { Outlet } from 'react-router-dom';
import Footer from '../footer/Footer';
import s from './MainLayouts.module.css';

const MainLayouts = () => {
  return (
    <div className={s.shell}>
      <Header />
      <main className={s.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default MainLayouts
