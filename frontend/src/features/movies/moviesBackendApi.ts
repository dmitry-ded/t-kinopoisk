import axios, { isAxiosError } from "axios";
import { getUrl } from "../auth/authApi";

const URL = getUrl();

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
  Favorite: (movieId: number) => `/api/movies/${movieId}/favorite`,
  Rating: (movieId: number) => `/api/movies/${movieId}/rating`,
  RatingStats: (movieId: number) => `/api/movies/${movieId}/rating/stats`,
  Favorites: "/api/movies/favorites",
}

export async function addFavoriteRequest(movieId: number): Promise<FavoriteResponse> {
  try {
    const res = await api.post<FavoriteResponse>(MoviesApiPath.Favorite(movieId));
    return res.data;
  } catch (e) {
    throw new Error(e, "Ошибка добавления в избранное");
  }
}

export async function removeFavoriteRequest(movieId: number): Promise<void> {
  try {
    await api.delete(MoviesApiPath.Favorite(movieId));
  } catch (e) {
    throw new Error(e, "Ошибка удаления из избранного");
  }
}

export async function listFavoriteRequest(): Promise<FavoriteResponse[]> {
  try {
    const res = await api.get<FavoriteResponse[]>(MoviesApiPath.Favorites);
    return res.data;
  } catch (e) {
    throw new Error(e, "Ошибка загрузки избранного");
  }
}

export async function setRatingRequest(movieId: number, rating: number): Promise<RatingResponse> {
  try {
    const res = await api.put<RatingResponse>(MoviesApiPath.Rating(movieId), { rating });
    return res.data;
  } catch (e) {
    throw new Error(e, "Ошибка сохранения оценки");
  }
}

export async function getRatingOrNull(movieId: number): Promise<RatingResponse> {
  try {
    const res = await api.get<RatingResponse>(MoviesApiPath.Rating(movieId));
    return res.data;
  } catch (e) {
    if (isAxiosError(e) && e.response?.status === 404) {
      return null;
    }
    throw e;
  }
}

export async function deleteRatingRequest(movieId: number): Promise<void> {
  try {
    await api.delete(MoviesApiPath.Rating(movieId));
  } catch (e) {
    throw new Error(e, "Ошибка удаления оценки");
  }
}


export async function getRatingStatsRequest(movieId: number): Promise<RatingStatsResponse> {
  try {
    const res = await api.get<RatingStatsResponse>(MoviesApiPath.RatingStats(movieId));
    return res.data;
  } catch (e) {
    throw new Error(e, "Ошибка загрузки статистики оценок");
  }
}
