import { Link } from 'react-router-dom';
import styles from '../styles/components/BlogCard.module.css';

// Pastel palette inspired by Excalidraw
const EXCALIDRAW_COLORS = [
    'rgb(253 186 116 / 0.4)', // orange
  'rgb(52 211 153 / 0.4)', // mint
  'rgb(249 168 212 / 0.4)', // rose
  'rgb(59 130 246 / 0.4)', // yellow
  'rgb(251 113 133 / 0.4)', // sky blue
  'rgb(251 113 133 / 0.4)', // pink
  'rgb(199 210 254 / 0.4)', // lavender
  'rgb(252 165 165 / 0.4)', // light red
  'rgb(217 249 157 / 0.4)', // lime
  'rgb(153 246 228 / 0.4)'  // aqua
];

// Capitalize the first letter, rest lowercase
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Hash a string to deterministically pick a color index
function colorForTag(tag) {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash << 5) - hash + tag.charCodeAt(i);
    hash |= 0;
  }
  return EXCALIDRAW_COLORS[Math.abs(hash) % EXCALIDRAW_COLORS.length];
}

export default function BlogCard({ post }) {
  // Short excerpt from markdown
  const getExcerpt = (content) => {
    if (!content) return '';
    const stripped = content.replace(/[#*`]/g, '');
    return stripped.length > 150 ? stripped.slice(0, 150) + '…' : stripped;
  };

  // Merge tags + languages, remove dupes (case-insensitive), capitalize
  const allTags = [
    ...(Array.isArray(post.languages) ? post.languages : []),
    ...(Array.isArray(post.tags) ? post.tags : [])
  ];
  const uniqueCapitalizedTags = [
    ...new Set(allTags.map(t => t.toLowerCase()))
  ].map(capitalize);

  return (
    <Link to={`/blog/${post.slug}`} className={styles.cardLink}>
      <div className={styles.cardContent}>
        {post.coverImageUrl && (
          <div className={styles.imageContainer}>
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className={styles.cardImage}
            />
            <div className={styles.imageOverlay} />
          </div>
        )}

        <div className={styles.cardBody}>
          <div className={styles.cardMeta}>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            {post.views && <span className={styles.metaDivider}>•</span>}
            {post.views && <span>{post.views} views</span>}
          </div>

          <h2 className={styles.cardTitle}>{post.title}</h2>

          {post.tagline ? (
            <p className={styles.cardTagline}>{post.tagline}</p>
          ) : (
            post.content && (
              <p className={styles.cardExcerpt}>{getExcerpt(post.content)}</p>
            )
          )}

          {uniqueCapitalizedTags.length > 0 && (
            <div className={styles.tagsContainer}>
              {uniqueCapitalizedTags.map((tag) => (
                <span
                  key={tag}
                  className={styles.tag}
                  style={{ backgroundColor: colorForTag(tag), color: '#000' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
