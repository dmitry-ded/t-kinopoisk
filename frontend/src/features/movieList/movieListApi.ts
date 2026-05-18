import axios, { AxiosError } from "axios";
import { getUrl } from "../auth/authApi";

const URL = getUrl();
const API_PREFIX = '/api/movie-lists';

const api = axios.create({
  baseURL: URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export type MovieListRequest = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
};

export type MovieListItemRow = {
  movieId: number;
  position: number;
  addedAt: string;
};

export type MovieListDetail = {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  items: MovieListItemRow[];
};

export type CommunityUserListsResponse = {
  userId: number;
  login: string;
  lists: MovieListRequest[];
};

export type CreateMovieListBody = {
  title: string;
  description?: string | null;
  isPublic?: boolean;
};

export type PatchMovieListBody = {
  title?: string | null;
  description?: string | null;
  isPublic?: boolean | null;
};

export const MovieListsApiPath = {
  myLists: () => API_PREFIX,
  listById: (listId: number) => `${API_PREFIX}/${listId}`,
  listMovies: (listId: number) => `${API_PREFIX}/${listId}/movies`,
  listMovie: (listId: number, movieId: number) => `${API_PREFIX}/${listId}/movies/${movieId}`,
  userLists: (userId: number) => `/api/users/${userId}/movie-lists`,
  communityLists: () => '/api/community/lists',
};

export const listMyMovieLists = async (): Promise<MovieListRequest[]> => {
  try {
    const res = await api.get<MovieListRequest[]>(MovieListsApiPath.myLists());
    return res.data;
  } catch (e) {
    throw new AxiosError(e, 'Ошибка загрузки списков');
  }
};

export const listMovieListsForUser = async (userId: number): Promise<MovieListRequest[]> => {
  try {
    const res = await api.get<MovieListRequest[]>(MovieListsApiPath.userLists(userId));
    return res.data;
  } catch (e) {
    throw new AxiosError(e, 'Ошибка загрузки списков пользователя');
  }
};

export const fetchCommunityLists = async (): Promise<CommunityUserListsResponse[]> => {
  try {
    const res = await api.get<CommunityUserListsResponse[]>(MovieListsApiPath.communityLists());
    return res.data;
  } catch (e) {
    throw new AxiosError(e, 'Ошибка загрузки каталога списков');
  }
};

export const createMovieList = async (body: CreateMovieListBody): Promise<MovieListRequest> => {
  try {
    const res = await api.post<MovieListRequest>(MovieListsApiPath.myLists(), body);
    return res.data;
  } catch (e) {
    throw new AxiosError(e, 'Ошибка создания списка');
  }
};

export const getMovieList = async (listId: number): Promise<MovieListDetail> => {
  try {
    const res = await api.get<MovieListDetail>(MovieListsApiPath.listById(listId));
    return res.data;
  } catch (e) {
    throw new AxiosError(e, 'Ошибка загрузки списка');
  }
};

export const addMovieToList = async (listId: number, movieId: number): Promise<MovieListItemRow> => {
  try {
    const res = await api.post<MovieListItemRow>(MovieListsApiPath.listMovies(listId), { movieId });
    return res.data;
  } catch (e) {
    throw new AxiosError(e, 'Ошибка добавления в список');
  }
};

export const deleteMovieList = async (listId: number): Promise<void> => {
  try {
    await api.delete(MovieListsApiPath.listById(listId));
  } catch (e) {
    throw new AxiosError(e, 'Ошибка удаления списка');
  }
};

export const removeMovieFromList = async (listId: number, movieId: number): Promise<void> => {
  try {
    await api.delete(MovieListsApiPath.listMovie(listId, movieId));
  } catch (e) {
    throw new AxiosError(e, 'Ошибка удаления фильма из списка');
  }
};