import { Link } from 'react-router-dom';
import type { CommunityUserListsResponse } from '../../features/movieList/movieListApi';
import s from './userCard.module.css';

type UserCardProps = {
  user: CommunityUserListsResponse;
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    <article className={s.userCard}>
      <h2 className={s.username}>{user.login}</h2>
      <div className={s.listsContainer}>
        {user.lists.map((list) => (
          <Link key={list.id} to={`/all-list-movies/${list.id}`} className={s.listItem}>
            <span className={s.listTitle}>{list.title}</span>
            <span className={s.listCount}>В списке: {list.itemCount}</span>
          </Link>
        ))}
      </div>
    </article>
  );
};

export default UserCard;
