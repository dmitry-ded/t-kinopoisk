import React from 'react'
import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div>
      ProfilePage
      <button onClick={handleLogout}>LOGOUT</button>
    </div>
  )
}

export default ProfilePage
