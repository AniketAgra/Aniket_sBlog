import styles from '../styles/components/PostCard.module.css';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useMemo } from 'react';

export default function PostCard({ post }) {
  // Unique tags from DB: merge languages + tags, case-insensitive dedupe
  const uniqueTags = useMemo(() => {
    const arr = [
      ...(Array.isArray(post?.languages) ? post.languages : []),
      ...(Array.isArray(post?.tags) ? post.tags : []),
    ]
      .map((t) => String(t).trim())
      .filter(Boolean);
    const uniqLower = [...new Set(arr.map((t) => t.toLowerCase()))];
    return uniqLower.map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  }, [post?.languages, post?.tags]);
  return (
    <article className={styles.card}>
      <div className={styles.media}>
  <img src={post.coverImageUrl || post.cover} alt={post.title} className={styles.img} />
        <div className={styles.mediaGradient} />
      </div>
      <div className={styles.content}>
        <div className={styles.metaRow}>
          {post.readingTime && <span>{post.readingTime}</span>}
          {post.createdAt && <span>{new Date(post.createdAt).toLocaleDateString()}</span>}
        </div>
        <h2 className={styles.title}>{post.title}</h2>
        {post.tagline ? (
          <p className={styles.excerpt}>{post.tagline}</p>
        ) : (
          <p className={styles.excerpt}>{post.excerpt}</p>
        )}
        {uniqueTags.length > 0 && (
          <div className={styles.tagsRow}>
            {uniqueTags.map((tag) => (
              <span key={tag} className={`${styles.tag} ${styles.tagGradient}`}>
                {tag}
              </span>
            ))}
          </div>
        )}
  <Link to={post._id ? `/posts/${post._id}` : '#'} className={styles.readMore}>
          Read more →
        </Link>
      </div>
    </article>
  );
}

PostCard.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string,
    slug: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    coverImageUrl: PropTypes.string,
    cover: PropTypes.string,
    readingTime: PropTypes.string,
    createdAt: PropTypes.string,
    excerpt: PropTypes.string,
    tagline: PropTypes.string,
  languages: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};
