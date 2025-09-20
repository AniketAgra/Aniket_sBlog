import PropTypes from 'prop-types';
import { AiOutlineSearch } from 'react-icons/ai';
import styles from '../styles/components/BlogSearchFilter.module.css';

/**
 * BlogSearchFilter
 * Controlled component.
 * Props:
 * - value: { q?: string, category?: 'all'|'mern'|'react'|'personal' }
 * - onChange: (nextValue) => void
 */
export default function BlogSearchFilter({ value, onChange }) {
  const { q = '', category = 'all' } = value || {};

  const categories = [
    { key: 'all', label: 'All' },
    { key: 'mern', label: 'MERN' },
    { key: 'react', label: 'React' },
    { key: 'personal', label: 'Personal' },
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <AiOutlineSearch className={styles.searchIcon} />
          <input
            value={q}
            onChange={(e) => onChange({ ...value, q: e.target.value })}
            placeholder="Search posts..."
            className={styles.searchInput}
          />
        </div>
        <div className={styles.rightGroup}>
          <div className={styles.chips}>
            {categories.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`${styles.chip} ${category === c.key ? styles.chipActive : ''}`}
                onClick={() => onChange({ ...value, category: c.key })}
                aria-pressed={category === c.key}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

BlogSearchFilter.propTypes = {
  value: PropTypes.shape({
    q: PropTypes.string,
    category: PropTypes.oneOf(['all', 'mern', 'react', 'personal']),
  }),
  onChange: PropTypes.func.isRequired,
};
