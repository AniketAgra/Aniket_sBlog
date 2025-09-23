import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from '../styles/components/RelatedArticles.module.css';

export default function RelatedArticles({ items }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <section className={styles.wrap} aria-labelledby="related-articles">
      <h2 id="related-articles" className={styles.title}>Related Articles</h2>
      <div className={styles.grid}>
        {items.map((p) => (
          <Link key={p._id || p.slug} to={p._id ? `/posts/${p._id}` : `/posts/${p.slug}`} className={styles.card}>
            <div className={styles.thumb} aria-hidden={!p.coverImageUrl}>
              {p.coverImageUrl ? (
                <img src={p.coverImageUrl} alt={p.title || 'Article cover'} />
              ) : (
                <div className={styles.placeholder} />
              )}
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardTitle}>{p.title}</div>
              {p.tagline && <div className={styles.cardSubtitle}>{p.tagline}</div>}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

RelatedArticles.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    slug: PropTypes.string,
    title: PropTypes.string,
    coverImageUrl: PropTypes.string,
    tagline: PropTypes.string,
  })),
};
