import PropTypes from 'prop-types';
import styles from '../styles/components/AuthorCard.module.css';

export default function AuthorCard({ author }) {
  if (!author) return null;
  const name = author.name || author.username || 'Author';
  const subtitle = author.bio || 'Tech Enthusiast';
  return (
    <section className={styles.card} aria-labelledby="about-author">
      <h2 id="about-author" className={styles.title}>About the Author</h2>
      <div className={styles.row}>
        <img
          src={author.profilePicture || 'https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=' + encodeURIComponent(name)}
          alt={name}
          className={styles.avatar}
        />
        <div className={styles.meta}>
          <div className={styles.name}>{name}</div>
          {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
        </div>
      </div>
    </section>
  );
}

AuthorCard.propTypes = {
  author: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    name: PropTypes.string,
    username: PropTypes.string,
    profilePicture: PropTypes.string,
    bio: PropTypes.string,
  }),
};
