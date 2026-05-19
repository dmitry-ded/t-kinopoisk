import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { makeStore } from '../../app/store';
import * as authApi from '../../features/auth/authApi';

const renderLoginPage = () => {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </Provider>,
  );
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('отрисовывает форму входа', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: 'Вход' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите логин')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Введите пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Зарегистрироваться' })).toBeInTheDocument();
  });

  it('при успешном входе не показывает ошибку', async () => {
    vi.spyOn(authApi, 'loginRequest').mockResolvedValue({ message: 'OK' });
    vi.spyOn(authApi, 'meRequest').mockResolvedValue({ id: 1, login: 'testuser' });

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByPlaceholderText('Введите логин'), 'test');
    await user.type(screen.getByPlaceholderText('Введите пароль'), 'test');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(authApi.loginRequest).toHaveBeenCalledWith({
        login: 'test',
        password: 'test',
      });
    });

    expect(screen.queryByText(/не удалось/i)).not.toBeInTheDocument();
  });

  it('при ошибке входа показывает сообщение', async () => {
    vi.spyOn(authApi, 'loginRequest').mockRejectedValue(new Error('Неверный логин или пароль'));

    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByPlaceholderText('Введите логин'), 'wrong');
    await user.type(screen.getByPlaceholderText('Введите пароль'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Не удалось выполнить вход')).toBeInTheDocument();
  });
});
