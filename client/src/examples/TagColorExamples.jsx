import { BlogCard } from '../components';
import { getTagColors, getRandomTagColor } from '../utils/tagColors';

/**
 * Example usage of random tag colors
 */

// Example 1: Using random colors for each card (default behavior)
function BlogWithRandomColors({ posts }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard 
          key={post._id} 
          post={post} 
          useRandomColors={true} // Random colors each time
        />
      ))}
    </div>
  );
}

// Example 2: Using consistent colors based on tag names
function BlogWithConsistentColors({ posts }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <BlogCard 
          key={post._id} 
          post={post} 
          useRandomColors={false} // Same tag = same color
        />
      ))}
    </div>
  );
}

// Example 3: Manual color application
function ManualColorExample() {
  const tags = ['React', 'JavaScript', 'CSS'];
  
  // Get random colors for all tags
  const randomColors = getTagColors(tags, true);
  
  // Get consistent colors for all tags
  const consistentColors = getTagColors(tags, false);
  
  // Get a single random color
  const singleRandomColor = getRandomTagColor();
  
  return (
    <div>
      <h3>Random Colors:</h3>
      {tags.map(tag => (
        <span key={`random-${tag}`} style={{
          background: randomColors[tag].gradient,
          boxShadow: randomColors[tag].shadow,
          padding: '4px 12px',
          borderRadius: '999px',
          color: 'white',
          margin: '4px'
        }}>
          {tag}
        </span>
      ))}
      
      <h3>Consistent Colors:</h3>
      {tags.map(tag => (
        <span key={`consistent-${tag}`} style={{
          background: consistentColors[tag].gradient,
          boxShadow: consistentColors[tag].shadow,
          padding: '4px 12px',
          borderRadius: '999px',
          color: 'white',
          margin: '4px'
        }}>
          {tag}
        </span>
      ))}
    </div>
  );
}

export { BlogWithRandomColors, BlogWithConsistentColors, ManualColorExample };
