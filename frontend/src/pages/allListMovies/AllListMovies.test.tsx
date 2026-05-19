import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AllListMovies from './AllListMovies';
import { makeStore } from '../../app/store';
import * as movieListApi from '../../features/movieList/movieListApi';
import * as moviesApi from '../../features/movies/moviesApi';
import { RequestStatus } from '../../features/auth/authSlice';

const renderAllListMovies = (listId: string, options?: { userId?: number; login?: string }) => {
  const store = makeStore(
    options?.userId
      ? {
          auth: {
            user: { id: options.userId, login: options.login ?? 'user' },
            status: RequestStatus.Idle,
            error: null,
            sessionChecked: true,
          },
          favorites: {
            ids: [],
            status: RequestStatus.Idle,
            error: null,
          },
        }
      : undefined,
  );

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/all-list-movies/${listId}`]}>
        <Routes>
          <Route path="/all-list-movies/:listId" element={<AllListMovies />} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe('AllListMovies', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('при некорректном id показывает ошибку', () => {
    renderAllListMovies('abc');

    expect(screen.getByText('Некорректный id списка')).toBeInTheDocument();
  });

  it('показывает загрузку, затем пустой список', async () => {
    vi.spyOn(movieListApi, 'getMovieList').mockResolvedValue({
      id: 12,
      userId: 1,
      title: 'Пустой список',
      description: null,
      isPublic: false,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      items: [],
    });

    renderAllListMovies('12', { userId: 1 });

    expect(screen.getByText('Загрузка списка...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Загрузка списка...')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Пустой список' })).toBeInTheDocument();
    expect(
      screen.getByText('В этом списке пока нет фильмов. Добавь их с карточки фильма.'),
    ).toBeInTheDocument();
  });

  it('показывает фильмы в списке', async () => {
    vi.spyOn(movieListApi, 'getMovieList').mockResolvedValue({
      id: 12,
      userId: 1,
      title: 'Список с фильмами',
      description: 'Описание списка',
      isPublic: true,
      createdAt: '2025-06-01T12:00:00Z',
      updatedAt: '2025-06-01T12:00:00Z',
      items: [{ movieId: 350, position: 1, addedAt: '2025-01-01T00:00:00Z' }],
    });

    vi.spyOn(moviesApi, 'getMovieById').mockImplementation(async (id: number) => ({
      id,
      name: 'Фильм в списке',
      year: 2020,
      genres: [{ name: 'драма' }],
      poster: { previewUrl: 'https://example.com/poster.jpg' },
    }));

    renderAllListMovies('12', { userId: 1, login: 'test' });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Список с фильмами' })).toBeInTheDocument();
    });

    expect(screen.getByText('Фильм в списке')).toBeInTheDocument();
    expect(screen.getByText('Публичный')).toBeInTheDocument();
    expect(screen.getByText('Описание списка')).toBeInTheDocument();
  });
  it('при ошибке загрузки списка показывает баннер', async () => {
    vi.spyOn(movieListApi, 'getMovieList').mockRejectedValue(new Error('Сеть недоступна'));

    renderAllListMovies('12');

    expect(screen.getByText('Загрузка списка...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Загрузка списка...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Ошибка')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /список/i })).not.toBeInTheDocument();
  });
});
