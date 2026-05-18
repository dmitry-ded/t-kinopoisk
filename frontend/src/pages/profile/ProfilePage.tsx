import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser, selectUsername } from '../../features/auth/authSlice';
import { Link, useNavigate } from 'react-router-dom';
import s from './profilePage.module.css';
import { useEffect, useState } from 'react';
import { deleteMovieList, listMyMovieLists } from '../../features/movieList/movieListApi';
import ProfileListCard from '../../components/profileListCard/ProfileListCard';
import { getErrorMessage } from '../../utils/errorHandler';

type ListPreview = {
  id: number;
  title: string;
  itemCount: number;
  isPublic: boolean;
  description: string | null;
};

const ProfilePage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const username = useAppSelector(selectUsername);
  const [loading, setLoading] = useState(true);
  const [listsMovies, setListsMovies] = useState<ListPreview[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadList = async () => {
      setLoading(true);
      try {
        const res = await listMyMovieLists();
        setListsMovies(res);
      } finally {
        setLoading(false);
      }
    };
    loadList();
  }, []);

  const handleDeleteListMovies = async (id: number) => {
    setDeleteError(null);
    try {
      await deleteMovieList(id);
      setListsMovies((prev) => prev.filter((list) => list.id !== id));
    } catch (e) {
      setDeleteError(getErrorMessage(e));
    }
  };

  const handleLogout = () => {
    try {
      dispatch(logoutUser());
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className={s.page}>
      <header className={s.head}>
        <h1 className={s.title}>Профиль</h1>
        <p className={s.subtitle}>
          {username ? (
            <>
              Вы вошли как <strong>{username}</strong>
            </>
          ) : (
            <>Личный кабинет</>
          )}
        </p>
      </header>

      <div className={s.toolbar}>
        <Link className={s.btnPrimary} to="/create-list">
          Новый список
        </Link>
        <Link className={s.btnGhost} to="/profile/favorites">
          Избранное
        </Link>
        <button type="button" className={s.btnDanger} onClick={handleLogout}>
          Выйти
        </button>
      </div>

      <h2 className={s.sectionTitle}>Мои списки</h2>

      {loading ? (
        <p className={s.loading}>Загрузка списков...</p>
      ) : listsMovies.length === 0 ? (
        <div className={s.empty}>
          <p className={s.emptyTitle}>Пока нет ни одного списка</p>
          <p className={s.emptyText}>Создайте папку и добавляйте в неё фильмы с карточки фильма.</p>
          <Link className={s.emptyLink} to="/create-list">
            Создать первый список
          </Link>
        </div>
      ) : (
        <>
          <div className={s.grid}>
            {listsMovies.map((list) => (
              <ProfileListCard
                key={list.id}
                id={list.id}
                title={list.title}
                itemCount={list.itemCount}
                isPublic={list.isPublic}
                description={list.description}
                onDelete={handleDeleteListMovies}
              />
            ))}
          </div>
          {deleteError ? <div className={s.errorMessage}>{deleteError}</div> : null}
        </>
      )}
    </div>
  );
};

export default ProfilePage;
