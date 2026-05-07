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
import { useAppDispatch } from './app/hooks';
import { bootstrapSession } from './features/auth/authSlice';

function App() {

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapSession());
  }, [])

  return (
    <Routes>
      <Route element={<MainLayouts />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
