import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import UserRatedPage from './UserRatedPage';
import * as leaderboardApi from '../../features/movies/leaderboardApi';
import * as moviesApi from '../../features/movies/moviesApi';

describe('UserRatedPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('отрисовывает заголовок и кнопки сортировки', () => {
    vi.spyOn(leaderboardApi, 'fetchLeaderboard').mockResolvedValue([]);

    render(
      <MemoryRouter>
        <UserRatedPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Фильмы по рейтингу пользователей' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'По убыванию' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'По возрастанию' })).toBeInTheDocument();
  });

  it('показывает загрузку, затем пустой рейтинг', async () => {
    vi.spyOn(leaderboardApi, 'fetchLeaderboard').mockResolvedValue([]);

    render(
      <MemoryRouter>
        <UserRatedPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Загрузка фильмов...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Загрузка фильмов...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Пока нет фильмов с оценками пользователей')).toBeInTheDocument();
  });

  it('показывает фильмы с пользовательским рейтингом', async () => {
    vi.spyOn(leaderboardApi, 'fetchLeaderboard').mockResolvedValue([
      { movieId: 350, average: 9, count: 5 },
    ]);
    vi.spyOn(moviesApi, 'getMovieById').mockImplementation(async (id: number) => ({
      id,
      name: 'Топ фильм',
      year: 2022,
      rating: { kp: 8 },
      poster: { previewUrl: 'https://example.com/poster.jpg' },
    }));

    render(
      <MemoryRouter>
        <UserRatedPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Топ фильм')).toBeInTheDocument();
    });

    expect(screen.getByText('9 - оценок: 5')).toBeInTheDocument();
  });

  it('при ошибке API показывает сообщение', async () => {
    vi.spyOn(leaderboardApi, 'fetchLeaderboard').mockRejectedValue(new Error('fail'));

    render(
      <MemoryRouter>
        <UserRatedPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.queryByText('Загрузка фильмов...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Ошибка')).toBeInTheDocument();
  });

  it('переключает сортировку и перезагружает данные', async () => {
    const fetchSpy = vi
      .spyOn(leaderboardApi, 'fetchLeaderboard')
      .mockResolvedValueOnce([{ movieId: 350, average: 9, count: 5 }])
      .mockResolvedValueOnce([]);

    vi.spyOn(moviesApi, 'getMovieById').mockImplementation(async (id: number) => ({
      id,
      name: 'Топ фильм',
      year: 2022,
      rating: { kp: 8 },
      poster: { previewUrl: 'https://example.com/poster.jpg' },
    }));

    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <UserRatedPage />
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Топ фильм')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'По возрастанию' }));

    await waitFor(() => {
      expect(screen.getByText('Пока нет фильмов с оценками пользователей')).toBeInTheDocument();
    });

    expect(fetchSpy).toHaveBeenCalledWith('desc');
    expect(fetchSpy).toHaveBeenCalledWith('asc');
  });
});
