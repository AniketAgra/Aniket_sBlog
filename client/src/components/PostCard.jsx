import styles from '../styles/components/PostCard.module.css';

export default function PostCard({ post }) {
  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <img src={post.cover} alt={post.title} className={styles.img} />
        <div className={styles.mediaGradient} />
      </div>
      <div className={styles.content}>
        <div className={styles.metaRow}>
          <span>{post.readingTime}</span>
          <span>{new Date(post.date).toLocaleDateString()}</span>
        </div>
        <h2 className={styles.title}>{post.title}</h2>
        <p className={styles.excerpt}>{post.excerpt}</p>
        <div className={styles.tagsRow}>
          {post.tags?.map((tag) => (
            <span key={tag} className={`${styles.tag} ${styles.tagGradient}`}>
              {tag}
            </span>
          ))}
        </div>
        <a href={`/blog/${post.id}`} className={styles.readMore}>
          Read more →
        </a>
      </div>
    </article>
  );
}
