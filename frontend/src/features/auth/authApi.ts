import axios, { AxiosError } from "axios";

export const getUrl = () => {
  if (typeof window !== "undefined" && !window.location.host.includes("localhost")) {
    return "https://tkinopoisk-a1c5zmy0.b4a.run";
  }

  return "http://localhost:8080";
}

const URL = getUrl();
const API_PREFIX = '/api/auth/';

export const api = axios.create({
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

type AuthOkResponse = {
  message: string;
};

export type MePayload = {
  authenticated: boolean;
  id: number | null;
  login: string | null;
};

export const AuthApiPath = {
  Login:`${API_PREFIX}login`,
  Register: `${API_PREFIX}register`,
  Logout: `${API_PREFIX}logout`,
  Me: `${API_PREFIX}me`,
}

const requestAuth = async (url: string, payload: AuthPayload): Promise<AuthOkResponse> => {
  try {
    const res = await api.post<AuthOkResponse>(url, payload);
    return res.data;
  } catch (e) {
    const err = e as AxiosError<{ message?: string}>;
    const message = err.response?.data?.message ?? err.message ?? 'Ошибка авторизации';
    throw new Error(message, { cause: e});
  }
}

export const meRequest = async (): Promise<AuthUser | null> => {
  const res = await api.get<MePayload>(AuthApiPath.Me);
  const data = res.data

  if (!data.authenticated) {
    return null;
  }
  if (data.id == null || data.login == null) {
    return null;
  }
  return { id: data.id, login: data.login };
}

export const logoutRequest = async (): Promise<void> => {
  await api.post(AuthApiPath.Logout);
}

export const loginRequest = async (payload: AuthPayload): Promise<AuthOkResponse> => {
  return requestAuth(AuthApiPath.Login, payload);
}

export const registerRequest = async (payload: AuthPayload): Promise<AuthOkResponse> => {
  return requestAuth(AuthApiPath.Register, payload);
}
