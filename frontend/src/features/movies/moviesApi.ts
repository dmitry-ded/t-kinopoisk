import axios, { AxiosError } from "axios";
import { mockMoviesById } from "../../mock/movies";

const poiskkino = axios.create({
  baseURL: import.meta.env.VITE_POISKKINO_BASE_URL,
  headers: {
    "X-API-KEY": import.meta.env.VITE_POISKKINO_API_KEY,
  },
});

export async function getMovieById(id: number) {
  try {
    const res = await poiskkino.get(`/v1.4/movie/${id}`);
    return res.data;
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    const status = err.response?.status;
    
    if (status === 403) {
      const mockMovie = mockMoviesById[id];
      if (mockMovie) return mockMovie;
    }
  }
}
