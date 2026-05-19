import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import ProfilePage from './ProfilePage';
import { makeStore } from '../../app/store';
import * as movieListApi from '../../features/movieList/movieListApi';
import { RequestStatus } from '../../features/auth/authSlice';

const renderProfilePage = (login = 'testuser') => {
  const store = makeStore({
    auth: {
      user: { id: 1, login },
      status: RequestStatus.Idle,
      error: null,
      sessionChecked: true,
    },
    favorites: {
      ids: [],
      status: RequestStatus.Idle,
      error: null,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </Provider>
  );
};

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('показывает профиль и имя пользователя', async () => {
    vi.spyOn(movieListApi, 'listMyMovieLists').mockResolvedValue([]);

    renderProfilePage('ivan');

    expect(screen.getByRole('heading', { name: 'Профиль' })).toBeInTheDocument();
    expect(screen.getByText('ivan')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Новый список' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Избранное' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Выйти' })).toBeInTheDocument();
  });

  it('показывает загрузку, затем пустые списки', async () => {
    vi.spyOn(movieListApi, 'listMyMovieLists').mockResolvedValue([]);

    renderProfilePage();

    expect(screen.getByText('Загрузка списков...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Загрузка списков...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Пока нет ни одного списка')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Создать первый список' })).toBeInTheDocument();
  });

  it('показывает карточки списков', async () => {
    vi.spyOn(movieListApi, 'listMyMovieLists').mockResolvedValue([
      {
        id: 10,
        userId: 1,
        title: 'Мой топ',
        description: 'Описание',
        isPublic: true,
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z',
        itemCount: 5,
      },
    ]);

    renderProfilePage();

    await waitFor(() => {
      expect(screen.getByText('Мой топ')).toBeInTheDocument();
    });

    expect(screen.getByText('Фильмов:')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Публичный')).toBeInTheDocument();
  });
});