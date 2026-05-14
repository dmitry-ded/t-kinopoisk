import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import s from './createMovieList.module.css';
import { createMovieList } from '../../features/movieList/movieListApi';

const DESC_MAX = 300;

const CreateMovieListPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const t = title.trim();
    if (!t) {
      setError('Введите название списка');
      return;
    }
    setSaving(true);
    try {
      await createMovieList({
        title: t,
        description: description.trim() ? description.trim() : null,
        isPublic,
      });
      navigate('/profile');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать список');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={s.createListPage}>
      <h1 className={s.title}>Новый список</h1>
      <p className={s.lead}>Создайте список фильмов. Фильмы можно будет добавлять из карточки.</p>

      <form onSubmit={handleSubmit} noValidate>
        <div className={s.panel}>
          <div className={s.block}>
            <label className={s.label} htmlFor="list-description">
              Описание списка
              <span className={s.labelHint}> (не более {DESC_MAX} символов)</span>
            </label>
            <textarea
              id="list-description"
              className={s.textarea}
              value={description}
              maxLength={DESC_MAX}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
            />
            <p className={s.counter}>
              {description.length} / {DESC_MAX}
            </p>
          </div>

          <div className={s.block}>
            <label className={s.label} htmlFor="list-title">
              Название списка
            </label>
            <input
              id="list-title"
              className={s.input}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              autoComplete="off"
            />
          </div>

          <div className={s.privacyRow}>
            <label className={s.checkboxLine}>
              <input
                type="checkbox"
                className={s.checkbox}
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={saving}
              />
              <span className={s.checkboxText}>Публичный список</span>
            </label>
            <p className={s.privacyHint}>
              Если галочка выключена - список видите только вы. Если включена - другие пользователи
              смогут посмотреть его у вас в профиле.
            </p>
          </div>
        </div>

        {error ? <p className={s.error}>{error}</p> : null}

        <div className={s.actions}>
          <Link className={s.back} to="/profile">
            ← Назад в профиль
          </Link>
          <button type="submit" className={s.primaryBtn} disabled={saving}>
            {saving ? "Создание..." : "Создать список"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateMovieListPage;
