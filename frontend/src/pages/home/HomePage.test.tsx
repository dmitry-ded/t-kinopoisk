import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import * as moviesApi from '../../features/movies/moviesApi';

describe('HomePage', () => {
  beforeEach(() => {
    vi.spyOn(moviesApi, 'getMovieById').mockResolvedValue({
      id: 350,
      name: 'Тестовый фильм',
      year: 2020,
      rating: { kp: 8.1 },
      poster: { previewUrl: 'https://example.com/poster.jpg' },
    });
  });

  it('показывает загрузку, затем список фильмов', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    );

    expect(screen.getByText('Загрузка фильмов...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Загрузка фильмов...')).not.toBeInTheDocument();
    });

    expect(screen.getAllByText('Тестовый фильм').length).toBeGreaterThan(0);
  });
});