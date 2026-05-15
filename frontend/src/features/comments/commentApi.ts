import axios, { isAxiosError } from 'axios';
import { getUrl } from '../auth/authApi';

const URL = getUrl();
const API_PREFIX = '/api/movies/';

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export type MovieComment = {
  id: number;
  movieId: number;
  userId: number;
  authorLogin: string;
  text: string;
  createdAt: string;
  updatedAt: string;
};

export const CommentsApiPath = {
  list: (movieId: number) => `${API_PREFIX}${movieId}/comments`,
  one: (movieId: number, commentId: number) => `${API_PREFIX}${movieId}/comments/${commentId}`,
};

export const listMovieComments = async (movieId: number): Promise<MovieComment[]> => {
  try {
    const res = await api.get<MovieComment[]>(CommentsApiPath.list(movieId));
    return res.data;
  } catch (e) {
    throw new Error(e, 'Ошибка загрузки комментариев');
  }
};

export const createMovieComment = async (
  movieId: number,
  text: string,
): Promise<MovieComment> => {
  try {
    const res = await api.post<MovieComment>(CommentsApiPath.list(movieId), { text });
    return res.data;
  } catch (e) {
    throw new Error(e, 'Ошибка отправки комментария');
  }
};

export const updateMovieComment = async (
  movieId: number,
  commentId: number,
  text: string,
): Promise<MovieComment> => {
  try {
    const res = await api.patch<MovieComment>(CommentsApiPath.one(movieId, commentId), { text });
    return res.data;
  } catch (e) {
    throw new Error(e, 'Ошибка сохранения комментария');
  }
};

export const deleteMovieComment = async (movieId: number, commentId: number): Promise<void> => {
  try {
    await api.delete(CommentsApiPath.one(movieId, commentId));
  } catch (e) {
    throw new Error(e, 'Ошибка удаления комментария');
  }
};
