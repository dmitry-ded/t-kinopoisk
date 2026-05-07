import { createAppSlice } from "../../app/createAppSlice"
import { loginRequest, logoutRequest, meRequest, registerRequest, type AuthUser } from "./authApi";

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
  sessionChecked: boolean;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  sessionChecked: false,
}

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: (create) => ({
    loginUser: create.asyncThunk(
      async (userData: { username: string, password: string}) => {
        await loginRequest({
          login: userData.username,
          password: userData.password,
        })

        const user = await meRequest();
        return { user };
      },
      {
        pending: (state) => {
          state.status = 'loading';
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.status = 'idle';
          state.user = action.payload.user;
          state.sessionChecked = true;
        },
        rejected: (state, action) => {
          state.status = 'failed';
          state.error = action.payload as string;
        }
      }
    ),

    registerUser: create.asyncThunk(
      async (userData: { username: string, password: string}) => {
          await registerRequest({
            login: userData.username,
            password: userData.password,
          })

          const user = await meRequest();
          return { user }

      },
      {
        pending: (state) => {
          state.status = 'loading';
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.status = 'idle';
          state.user = action.payload.user;
          state.sessionChecked = true;
        },
        rejected: (state, action) => {
          state.status = 'failed';
          state.error = action.payload as string;
        }
      }
    ),

    logoutUser: create.asyncThunk(
      async (_, { rejectWithValue }) => {
        try {
          await logoutRequest();
          return true;
        } catch (e) {
          if (e instanceof Error) {
            return rejectWithValue(e.message);
          }
          return rejectWithValue('Ошибка выхода');
        }
      },
      {
        fulfilled: (state) => {
          state.user = null;
          state.status = 'idle';
          state.error = null;
        }
      }
    ),

    bootstrapSession: create.asyncThunk(
      async () => {
        try {
          return await meRequest();
        } catch {
          return null;
        }
      },
      {
        pending: (state) => {
          state.status = 'loading';
        },
        fulfilled: (state, action) => {
          state.user = action.payload;
          state.sessionChecked = true;
          state.status = 'idle';
        }
      }
    )
  }),
  selectors: {
    selectAuthStatus: state => state.status,
    selectUser: state => state.user,
    selectAuthError: state => state.error,
    selectUsername: (state) => state.user?.login ?? null,
    selectIsAuthenticated: (state) => state.user !== null,
    selectCheckedSession: (state) => state.sessionChecked,
  }
})

export const { logoutUser, loginUser, registerUser, bootstrapSession } = authSlice.actions
export const { selectAuthStatus, selectUsername, selectAuthError, selectUser, selectIsAuthenticated, selectCheckedSession } = authSlice.selectors