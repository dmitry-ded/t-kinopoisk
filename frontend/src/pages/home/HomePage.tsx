import React from 'react'
import { useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import styles from './homePage.module.css'

const HomePage = () => {

  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
  }

  return (
    <div className={styles.home}>
      <span>HOMEPAGE</span>
      <button onClick={handleLogout}>РАЗЛОГИНИТЬСЯ</button>
    </div>
  )
}

export default HomePage
