import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
  fetchCommunityLists,
  type CommunityUserListsResponse,
} from '../../features/movieList/movieListApi';
import s from './communityLists.module.css';

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
          let msg = 'Не удалось загрузить каталог списков';
          if (isAxiosError(e)) {
            const body = e.response?.data as { message?: string } | undefined;
            if (body?.message) msg = body.message;
            else if (e.message) msg = e.message;
          } else if (e instanceof Error) {
            msg = e.message;
          }
          setError(msg);
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
            <article key={user.userId} className={s.userCard}>
              <h2 className={s.username}>{user.login}</h2>
              <p className={s.userMeta}>id: {user.userId}</p>
              <div className={s.listsContainer}>
                {user.lists.map((list) => (
                  <Link key={list.id} to={`/all-list-movies/${list.id}`} className={s.listItem}>
                    <span className={s.listTitle}>{list.title}</span>
                    <span className={s.listCount}>В списке: {list.itemCount}</span>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default CommunityLists;
