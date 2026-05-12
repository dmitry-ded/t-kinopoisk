import { Link } from 'react-router-dom';
import s from './notFoundPage.module.css';
import classNames from 'classnames';

const NotFoundPage = () => {
  return (
    <div className={s.page}>
      <div className={s.inner}>
        <p className={s.code}>
          4<span className={s.codeAccent}>0</span>4
        </p>
        <h1 className={s.title}>Страница не найдена</h1>
        <p className={s.hint}>Такого адреса не существует.</p>
        <div className={s.actions}>
          <Link className={classNames(s.btn, s.btnPrimary)} to="/">
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
