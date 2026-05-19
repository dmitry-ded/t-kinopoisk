import axios, { AxiosError } from 'axios';
import { getUrl } from '../auth/authApi';

const URL = getUrl();

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type LeaderboardSort = 'desc' | 'asc';

export type Leaderboard = {
  movieId: number;
  average: number;
  count: number;
};

export const fetchLeaderboard = async (
  sort: LeaderboardSort = 'desc',
): Promise<Leaderboard[]> => {
  try {
    const res = await api.get<Leaderboard[]>('/api/movies/ratings/leaderboard', {
    params: { sort },
  });
  return res.data;
  } catch (e) {
    throw new AxiosError(e, "Ошибка загрузки рейтинга пользователй")
  }
};
