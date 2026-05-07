import axios, { AxiosError } from "axios";

// const URL = "https://tkinopoisk-a1c5zmy0.b4a.run";
const URL = "http://localhost:8080";


const api = axios.create({
  baseURL: URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type AuthPayload = {
  login: string;
  password: string;
}

export type AuthUser = {
  id: number;
  login: string;
}

interface AuthOkResponse {
  message: string;
};

export type MePayload = {
  authenticated: boolean;
  id: number | null;
  login: string | null;
};

async function requestAuth(url: string, payload: AuthPayload): Promise<AuthOkResponse> {
  try {
    const res = await api.post<AuthOkResponse>(url, payload);
    return res.data;
  } catch (e) {
    const err = e as AxiosError<{ message?: string}>;
    const message = err.response?.data?.message ?? err.message ?? 'Ошибка авторизации';
    throw new Error(message);
  }
}

export async function meRequest(): Promise<AuthUser | null> {
  const res = await api.get<MePayload>('/api/auth/me');
  const data = res.data

  if (!data.authenticated) {
    return null;
  }
  if (data.id == null || data.login == null) {
    return null;
  }
  return { id: data.id, login: data.login };
}

export async function logoutRequest(): Promise<void> {
  await api.post('/api/auth/logout');
}

export async function loginRequest(payload: AuthPayload): Promise<AuthOkResponse> {
  return requestAuth('/api/auth/login', payload);
}

export async function registerRequest(payload: AuthPayload): Promise<AuthOkResponse> {
  return requestAuth('/api/auth/register', payload);
}
