import { Link, useNavigate } from 'react-router-dom';
import s from './registerPage.module.css';
import { useAppDispatch } from '../../app/hooks';
import { useState, type FormEvent } from 'react';
import { registerUser } from '../../features/auth/authSlice';

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [messageError, setMessageError] = useState('');

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessageError('');
    try {
      await dispatch(registerUser({ username: login, password}));
      navigate('/profile');
    } catch (e) {
      setMessageError(e instanceof Error ? e.message : 'Не удалось выполнить регистрацию');
      console.error('reg err: ', e);
    }
  };

  return (
    <section className={s.page}>
      <div className={s.card}>
        <h1 className={s.title}>Регистрация</h1>
        <p className={s.subtitle}>
          Создай аккаунт, чтобы собирать персональную коллекцию фильмов
        </p>
        <form onSubmit={handleRegister} className={s.form}>
          <label className={s.label}>
            Логин
            <input
              type="text"
              className={s.input}
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              autoComplete="username"
              required
              placeholder="Придумайте логин"
            />
          </label>
          <label className={s.label}>
            Пароль
            <input
              type="password"
              className={s.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="password"
              required
              placeholder="Придумайте пароль"
            />
          </label>
          <button type="submit" className={s.primaryButton}>
            Зарегистрироваться
          </button>
        </form>

        {messageError ? <p className={s.errorMessage}>{messageError}</p> : null}

        <p className={s.authFooter}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </section>
  );
};

export default RegisterPage;
