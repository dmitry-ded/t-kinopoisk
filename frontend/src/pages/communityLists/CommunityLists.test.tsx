import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CommunityLists from './CommunityLists';
import * as movieListApi from '../../features/movieList/movieListApi';

const mockUser: movieListApi.CommunityUserListsResponse = {
  userId: 1,
  login: 'testuser',
  lists: [
    {
      id: 10,
      userId: 1,
      title: 'Лучшие фильмы',
      description: null,
      isPublic: true,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      itemCount: 3,
    },
  ],
};

describe('CommunityLists', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('показывает загрузку, затем пустой каталог', async () => {
    vi.spyOn(movieListApi, 'fetchCommunityLists').mockResolvedValue([]);

    render(
      <MemoryRouter>
        <CommunityLists />
      </MemoryRouter>
    );

    expect(screen.getByText('Загрузка каталога...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Загрузка каталога...')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'Списки пользователей' })).toBeInTheDocument();
    expect(
      screen.getByText(/Пока никто не опубликовал списки/)
    ).toBeInTheDocument();
  });

  it('показывает карточки пользователей со списками', async () => {
    vi.spyOn(movieListApi, 'fetchCommunityLists').mockResolvedValue([mockUser]);

    render(
      <MemoryRouter>
        <CommunityLists />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Загрузка каталога...')).not.toBeInTheDocument();
    });

    expect(screen.getByRole('heading', { name: 'testuser' })).toBeInTheDocument();
    expect(screen.getByText('Лучшие фильмы')).toBeInTheDocument();
    expect(screen.getByText('В списке: 3')).toBeInTheDocument();
  });

  it('при ошибке API показывает баннер', async () => {
    vi.spyOn(movieListApi, 'fetchCommunityLists').mockRejectedValue(new Error('Сеть недоступна'));

    render(
      <MemoryRouter>
        <CommunityLists />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('Загрузка каталога...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Ошибка')).toBeInTheDocument();
  });
});