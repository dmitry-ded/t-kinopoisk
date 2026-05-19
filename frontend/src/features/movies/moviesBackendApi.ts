import axios, { AxiosError } from "axios";
import { getUrl } from "../auth/authApi";

const URL = getUrl();
const API_PREFIX = '/api/movies/';

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export type FavoriteResponse = {
  movieId: number;
  createdAt: string;
};

export type RatingResponse = {
  movieId: number;
  rating: number;
};

export type RatingStatsResponse = {
  average: number | null;
  count: number;
};

export const MoviesApiPath = {
  Favorite: (movieId: number) => `${API_PREFIX}${movieId}/favorite`,
  Rating: (movieId: number) => `${API_PREFIX}${movieId}/rating`,
  RatingStats: (movieId: number) => `${API_PREFIX}${movieId}/rating/stats`,
  Favorites: `${API_PREFIX}favorites`,
}

export const addFavorite = async (movieId: number): Promise<FavoriteResponse> => {
  try {
    const res = await api.post<FavoriteResponse>(MoviesApiPath.Favorite(movieId));
    return res.data;
  } catch (e) {
    throw new AxiosError(e, "Ошибка добавления в избранное");
  }
}

export const removeFavorite = async (movieId: number): Promise<void> => {
  try {
    await api.delete(MoviesApiPath.Favorite(movieId));
  } catch (e) {
    throw new AxiosError(e, "Ошибка удаления из избранного");
  }
}

export const listFavorite = async (): Promise<FavoriteResponse[]> => {
  try {
    const res = await api.get<FavoriteResponse[]>(MoviesApiPath.Favorites);
    return res.data;
  } catch (e) {
    throw new AxiosError(e, "Ошибка загрузки избранного");
  }
}

export const setRating = async (movieId: number, rating: number): Promise<RatingResponse> => {
  try {
    const res = await api.put<RatingResponse>(MoviesApiPath.Rating(movieId), { rating });
    return res.data;
  } catch (e) {
    throw new AxiosError(e, "Ошибка сохранения оценки");
    
  }
}

export const getRating = async (movieId: number): Promise<RatingResponse | null> => {
  try {
    const res = await api.get<RatingResponse>(MoviesApiPath.Rating(movieId), {
      validateStatus: (status) => {
        return status === 200 || status === 403;
      }
    });
    
    if (res.status === 403) {
      return null;
    } 
    return res.data;
  } catch (e) {
    throw new AxiosError(e, "Ошибка получения оценки");
  }
}

export const deleteRating = async (movieId: number): Promise<void> => {
  try {
    await api.delete(MoviesApiPath.Rating(movieId));
  } catch (e) {
    throw new AxiosError(e, "Ошибка удаления оценки");
  }
}

export const getRatingStats = async (movieId: number): Promise<RatingStatsResponse> => {
  try {
    const res = await api.get<RatingStatsResponse>(MoviesApiPath.RatingStats(movieId));
    return res.data;
  } catch (e) {
    throw new AxiosError(e, "Ошибка загрузки статистики оценок");
  }
}
