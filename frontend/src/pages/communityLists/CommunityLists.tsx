import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import {
  fetchCommunityLists,
  type CommunityUserListsResponse,
} from '../../features/movieList/movieListApi';
import s from './communityLists.module.css';
import UserCard from '../../components/userCard/UserCard';
import { getErrorMessage } from '../../utils/errorHandler';

const CommunityLists = () => {
  const [users, setUsers] = useState<CommunityUserListsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCommunityLists();
        if (!cancelled) {
          setUsers(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError(getErrorMessage(e));
          setUsers([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className={s.communityPage}>
        <p className={s.loading}>Загрузка каталога...</p>
      </div>
    );
  }

  return (
    <div className={s.communityPage}>
      <h1 className={s.title}>Списки пользователей</h1>
      <p className={s.subtitle}>
        Нажми на список - откроется страница с фильмами.
      </p>

      {error ? <div className={s.errorBanner}>{error}</div> : null}

      {!error && users.length === 0 ? (
        <p className={s.empty}>
          Пока никто не опубликовал списки. Создай публичный список в профиле - он появится здесь.
        </p>
      ) : null}

      {users.length > 0 ? (
        <div className={s.grid}>
          {users.map((user) => (
            <UserCard key={user.userId} user={user} />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default CommunityLists;
