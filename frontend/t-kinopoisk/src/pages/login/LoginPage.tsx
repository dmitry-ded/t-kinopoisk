import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { loginUser } from '../../features/auth/authSlice';
import styles from './loginPage.module.css';
import { useState, type FormEvent, } from 'react';

const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [messageError, setMessageError] = useState('');

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessageError('');
    try {
      await dispatch(loginUser({ username: login, password })).unwrap();
      navigate('/profile');
    } catch (e) {
      setMessageError(e instanceof Error ? e.message : 'Не удалось выполнить вход');
      console.error('reg err: ', e);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Вход</h1>
        <p className={styles.subtitle}>
          Войди в аккаунт, чтобы смотреть и сохранять любимые фильмы
        </p>
        <form onSubmit={handleLogin} className={styles.form}>
          <label className={styles.label}>
            Логин
            <input
              type="text"
              className={styles.input}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              autoComplete='username'
              placeholder="Введите логин"
            />
          </label>
          <label className={styles.label}>
            Пароль
            <input
              type="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete='password'
              placeholder="Введите пароль"
            />
          </label>
          <button type="submit" className={styles.primaryButton}>
            Войти
          </button>
        </form>

        {messageError ? <p className={styles.errorMessage}>{messageError}</p> : null}

        <p className={styles.authFooter}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </section>
  );
};

export default LoginPage;
