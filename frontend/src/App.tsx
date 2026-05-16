import { Route, Routes } from 'react-router-dom';
import './App.module.css';
import MainLayouts from './components/layouts/MainLayouts';
import HomePage from './pages/home/HomePage';
import LoginPage from './pages/login/LoginPage';
import RegisterPage from './pages/register/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import ProtectedRoute from './components/protectedRoute/ProtectedRoute';
import NotFoundPage from './pages/notFound/NotFoundPage';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import {
  bootstrapSession,
  selectCheckedSession,
  selectIsAuthenticated,
} from './features/auth/authSlice';
import FavoritesPage from './pages/favorite/FavoritesPage';
import CardPage from './pages/cardPage/CardPage';
import { clearFavorites, fetchFavorites } from './features/movies/favoriteSlice';
import CreateMovieListPage from './pages/createMovieList/CreateMovieListPage';
import AllListMovies from './pages/allListMovies/AllListMovies';
import CommunityLists from './pages/communityLists/CommunityLists';
import UserRatedPage from './pages/userRated/UserRatedPage';

function App() {
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuthenticated);
  const sessionChecked = useAppSelector(selectCheckedSession);

  useEffect(() => {
    dispatch(bootstrapSession());
  }, []);

  useEffect(() => {
    if (!sessionChecked) return;
    if (isAuth) {
      dispatch(fetchFavorites());
    } else {
      dispatch(clearFavorites());
    }
  }, [sessionChecked, isAuth]);

  return (
    <Routes>
      <Route element={<MainLayouts />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/card/:movieId" element={<CardPage />} />
        <Route path="/explore/lists" element={<CommunityLists />} />
        <Route path="/all-list-movies/:listId" element={<AllListMovies />} />
        <Route path="/user-rated" element={<UserRatedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/favorites" element={<FavoritesPage />} />
          <Route path="/create-list" element={<CreateMovieListPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
