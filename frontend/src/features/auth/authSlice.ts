import { createAppSlice } from "../../app/createAppSice"
import { loginRequest, registerRequest } from "./authApi"

const TOKEN = 'token';
const USERNAME = 'username';

interface AuthState {
  token: string | null,
  username: string | null,
  status: 'idle' | 'loading' | 'failed',
  error: string | null,
}

const initialState: AuthState = {
  token: localStorage.getItem(TOKEN),
  username: localStorage.getItem(USERNAME),
  status: 'idle',
  error: null,
}

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: (create) => ({
    logout: create.reducer((state) => {
      state.token = null
      state.username = null
      state.status = 'idle'
      state.error = null
      localStorage.removeItem(TOKEN);
      localStorage.removeItem(USERNAME);
    }),

    loginUser: create.asyncThunk(
      async (userData: { username: string, password: string}, { rejectWithValue }) => {
        try {
          const data = await loginRequest({
            login: userData.username,
            password: userData.password,
          })
          localStorage.setItem(TOKEN, data.token);
          localStorage.setItem(USERNAME, userData.username);

          return { token: data.token, username: userData.username}
        } catch (e) {
          if (e instanceof Error) {
            return rejectWithValue(e.message || 'Ошибка входа')
          }
          return rejectWithValue('Ошибка регистрации')
        }
      },
      {
        pending: (state) => {
          state.status = 'loading';
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.status = 'idle';
          state.username = action.payload.username;
          state.token = action.payload.token;
        },
        rejected: (state, action) => {
          state.status = 'failed';
          state.error = action.payload as string;
        }
      }
    ),

    registerUser: create.asyncThunk(
      async (userData: { username: string, password: string}, { rejectWithValue }) => {
        try {
          await registerRequest({
            login: userData.username,
            password: userData.password,
          })

          const data = await loginRequest({
            login: userData.username,
            password: userData.password,
          })
          
          localStorage.setItem(TOKEN, data.token);
          localStorage.setItem(USERNAME, userData.username);

          return { token: data.token, username: userData.username}
        } catch (e) {
          if (e instanceof Error) {
            return rejectWithValue(e.message || 'Ошибка регистрации')
          }
          return rejectWithValue('Ошибка регистрации')
        }
      },
      {
        pending: (state) => {
          state.status = 'loading';
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.status = 'idle';
          state.username = action.payload.username;
          state.token = action.payload.token;
        },
        rejected: (state, action) => {
          state.status = 'failed';
          state.error = action.payload as string;
        }
      }
    )
  }),
  selectors: {
    selectToken: state => state.token,
    selectAuthStatus: state => state.status,
    selectUsername: state => state.username,
    selectAuthError: state => state.error, 
  }
})

export const { logout, loginUser, registerUser} = authSlice.actions
export const { selectToken, selectAuthStatus, selectUsername, selectAuthError} = authSlice.selectors