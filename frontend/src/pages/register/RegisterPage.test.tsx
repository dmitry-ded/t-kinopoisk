import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { makeStore } from '../../app/store';
import * as authApi from '../../features/auth/authApi';

const renderRegisterPage = () => {
  const store = makeStore();
  return render(
    <Provider store={store}>
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    </Provider>
  );
};

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('отрисовывает форму регистрации', () => {
    renderRegisterPage();

    expect(screen.getByRole('heading', { name: 'Регистрация' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Придумайте логин')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Придумайте пароль')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зарегистрироваться' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Войти' })).toBeInTheDocument();
  });

  it('при успешной регистрации вызывает API и не показывает ошибку', async () => {
    vi.spyOn(authApi, 'registerRequest').mockResolvedValue({ message: 'OK' });
    vi.spyOn(authApi, 'meRequest').mockResolvedValue({ id: 2, login: 'testuser' });

    const user = userEvent.setup();
    renderRegisterPage();

    await user.type(screen.getByPlaceholderText('Придумайте логин'), 'test');
    await user.type(screen.getByPlaceholderText('Придумайте пароль'), 'test');
    await user.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    await waitFor(() => {
      expect(authApi.registerRequest).toHaveBeenCalledWith({
        login: 'test',
        password: 'test',
      });
    });

    expect(screen.queryByText(/не удалось/i)).not.toBeInTheDocument();
  });
});