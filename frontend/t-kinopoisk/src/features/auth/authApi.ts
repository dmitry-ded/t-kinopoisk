import axios, { AxiosError } from "axios";

const URL = "http://localhost:8080";

const api = axios.create({
  baseURL: URL,
  headers: {
    "Content-Type": "application/json",
  },
});

type AuthPayload = {
  login: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
  };
};

async function requestAuth(url: string, payload: AuthPayload): Promise<AuthResponse> {
  try {
    const res = await api.post<AuthResponse>(url, payload);
    return res.data;
  } catch (e) {
    const err = e as AxiosError<{ message?: string}>;
    const message = err.response?.data?.message ?? err.message ?? 'Ошибка авторизации';
    throw new Error(message);
  }
}

export async function loginRequest(payload: AuthPayload): Promise<AuthResponse> {
  return requestAuth('/api/auth/login', payload);
}

export async function registerRequest(payload: AuthPayload): Promise<AuthResponse> {
  return requestAuth('/api/auth/register', payload);
}

export function readToken(): string | null{
  return localStorage.getItem('token');
}