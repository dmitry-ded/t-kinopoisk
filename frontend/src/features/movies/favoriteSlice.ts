import { createAppSlice } from "../../app/createAppSlice";
import { RequestStatus } from "../auth/authSlice";
import { addFavorite, listFavorite, removeFavorite } from "./moviesBackendApi";

interface FavoriteState {
  ids: number[];
  status: RequestStatus.Idle | RequestStatus.Loading | RequestStatus.Failed;
  error: string | null;
}

const initialState: FavoriteState =  {
  ids: [],
  status: RequestStatus.Idle,
  error: null,
}

export const favoritesSlice = createAppSlice({
  name: "favorites",
  initialState,
  reducers: (create) => ({
    clearFavorites: create.reducer((state) => {
      state.ids = [];
      state.status = RequestStatus.Idle;
      state.error = null;
    }),
    fetchFavorites: create.asyncThunk(
      async (_, { rejectWithValue }) => {
        try {
          const list = await listFavorite();
          return list.map((el) => el.movieId);
        } catch (e) {
          const message = e instanceof Error ? e.message : "Ошибка загрузки избранного";
          return rejectWithValue(message);
        }
      },
      {
        pending: (state) => {
          state.status = RequestStatus.Loading;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.status = RequestStatus.Idle;
          state.ids = action.payload;
        },
        rejected: (state, action) => {
          state.status = RequestStatus.Failed;
          state.error = action.payload as string;
        }
      }
    ),
    addFavorites: create.asyncThunk(
      async (movieId: number, { rejectWithValue }) => {
        try {
          await addFavorite(movieId);
          return movieId;
        } catch (e) {
          const message = e instanceof Error ? e.message : "Ошибка добавления в избранное";
          return rejectWithValue(message);
        }
      },
      {
        pending: (state) => {
          state.error = null;
        },
        fulfilled: (state, action) => {
          if (!state.ids.includes(action.payload)) {
            state.ids.push(action.payload);
          }
          state.status = RequestStatus.Idle;
        },
        rejected: (state, action) => {
          state.status = RequestStatus.Failed;
          state.error = action.payload as string;
        }
      }
    ),
    removeFavorites: create.asyncThunk(
      async (movieId: number, { rejectWithValue }) => {
        try {
          await removeFavorite(movieId);
          return movieId;
        } catch (e) {
          const message = e instanceof Error ? e.message : "Ошибка удаления из избранного";
          return rejectWithValue(message);
        }
      },
      {
        pending: (state) => {
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.ids = state.ids.filter((id) => id !== action.payload);
          state.status = RequestStatus.Idle;
        },
        rejected: (state, action) => {
          state.status = RequestStatus.Failed;
          state.error = action.payload as string;
        }
      }
    )
  }),
  selectors: {
    selectFavoriteIds: (state) => state.ids,
    selectFavoriteStatus: (state) => state.status,
    selectFavoriteError: (state) => state.error,
  },
});

export const { selectFavoriteError, selectFavoriteIds, selectFavoriteStatus } = favoritesSlice.selectors;

export const { fetchFavorites, removeFavorites, clearFavorites, addFavorites } = favoritesSlice.actions;
