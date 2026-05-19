import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import FavoritesPage from './FavoritesPage';
import * as moviesBackendApi from '../../features/movies/moviesBackendApi';
import * as moviesApi from '../../features/movies/moviesApi';

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('показывает загрузку, затем пустое избранное', async () => {
    vi.spyOn(moviesBackendApi, 'listFavorite').mockResolvedValue([]);

    render(
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Загрузка избранного...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Загрузка избранного...')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Избранное' })).toBeInTheDocument();
    expect(screen.getByText('Пока пусто - добавьте фильмы в избранное')).toBeInTheDocument();
  });

  it('показывает загрузку, затем карточки избранного', async () => {
    vi.spyOn(moviesBackendApi, 'listFavorite').mockResolvedValue([
      { movieId: 350, createdAt: '2025-01-01T00:00:00Z' },
    ]);
    vi.spyOn(moviesApi, 'getMovieById').mockImplementation(async (id: number) => ({
      id,
      name: 'Фильм из избранного',
      year: 2021,
      rating: { kp: 7.5 },
      poster: { previewUrl: 'https://example.com/poster.jpg' },
      countries: [{ name: 'США' }],
      genres: [{ name: 'драма' }],
      shortDescription: '...',
      movieLength: 120,
    }));

    render(
      <MemoryRouter>
        <FavoritesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Загрузка избранного...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('В списке: 1')).toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Фильм из избранного' })).toBeInTheDocument();
  });
});
