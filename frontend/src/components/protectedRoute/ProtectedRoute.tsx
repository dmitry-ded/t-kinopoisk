import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectCheckedSession, selectIsAuthenticated } from '../../features/auth/authSlice';

const ProtectedRoute = () => {

  const sessionChecked = useAppSelector(selectCheckedSession);
  const isAuth = useAppSelector(selectIsAuthenticated);

  if (!sessionChecked) {
    return <div>Загрузка</div>;
  }
  if (!isAuth) {
    return <Navigate to='/login' replace />;
  }
  return <Outlet />
}

export default ProtectedRoute
