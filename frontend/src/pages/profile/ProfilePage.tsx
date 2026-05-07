import { useAppDispatch } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      dispatch(logoutUser());
    } catch {

    }
    finally {
      navigate('/login');
    }
  };

  return (
    <div>
      ProfilePage
      <button onClick={handleLogout}>LOGOUT</button>
    </div>
  )
}

export default ProfilePage
