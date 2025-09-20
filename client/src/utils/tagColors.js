// Tag color utility functions

// Predefined gradient combinations for tags
const TAG_GRADIENTS = [
  {
    gradient: 'linear-gradient(to right, rgb(6 182 212), rgb(139 92 246), rgb(236 72 153))',
    shadow: '0 8px 18px rgba(6, 182, 212, 0.25)',
    shadowHover: '0 12px 24px rgba(6, 182, 212, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(16 185 129), rgb(20 184 166), rgb(6 182 212))',
    shadow: '0 8px 18px rgba(16, 185, 129, 0.25)',
    shadowHover: '0 12px 24px rgba(16, 185, 129, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(245 158 11), rgb(249 115 22), rgb(244 63 94))',
    shadow: '0 8px 18px rgba(245, 158, 11, 0.25)',
    shadowHover: '0 12px 24px rgba(245, 158, 11, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(99 102 241), rgb(168 85 247), rgb(236 72 153))',
    shadow: '0 8px 18px rgba(99, 102, 241, 0.25)',
    shadowHover: '0 12px 24px rgba(99, 102, 241, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(14 165 233), rgb(59 130 246), rgb(99 102 241))',
    shadow: '0 8px 18px rgba(14, 165, 233, 0.25)',
    shadowHover: '0 12px 24px rgba(14, 165, 233, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(236 72 153), rgb(244 63 94), rgb(249 115 22))',
    shadow: '0 8px 18px rgba(236, 72, 153, 0.25)',
    shadowHover: '0 12px 24px rgba(236, 72, 153, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(132 204 22), rgb(16 185 129), rgb(20 184 166))',
    shadow: '0 8px 18px rgba(132, 204, 22, 0.25)',
    shadowHover: '0 12px 24px rgba(132, 204, 22, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(139 92 246), rgb(236 72 153), rgb(244 63 94))',
    shadow: '0 8px 18px rgba(139, 92, 246, 0.25)',
    shadowHover: '0 12px 24px rgba(139, 92, 246, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(244 63 94), rgb(249 115 22), rgb(250 204 21))',
    shadow: '0 8px 18px rgba(244, 63, 94, 0.25)',
    shadowHover: '0 12px 24px rgba(244, 63, 94, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(45 212 191), rgb(6 182 212), rgb(59 130 246))',
    shadow: '0 8px 18px rgba(45, 212, 191, 0.25)',
    shadowHover: '0 12px 24px rgba(45, 212, 191, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(168 85 247), rgb(147 51 234), rgb(126 34 206))',
    shadow: '0 8px 18px rgba(168, 85, 247, 0.25)',
    shadowHover: '0 12px 24px rgba(168, 85, 247, 0.35)'
  },
  {
    gradient: 'linear-gradient(to right, rgb(34 197 94), rgb(22 163 74), rgb(21 128 61))',
    shadow: '0 8px 18px rgba(34, 197, 94, 0.25)',
    shadowHover: '0 12px 24px rgba(34, 197, 94, 0.35)'
  }
];

/**
 * Generate a hash from a string for consistent color selection
 * @param {string} str - The string to hash
 * @returns {number} - A positive integer hash
 */
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // Convert to 32-bit integer
  }
  return Math.abs(h);
}

/**
 * Get a consistent tag color based on the tag name
 * This ensures the same tag always gets the same color across the app
 * @param {string} tagName - The name of the tag
 * @returns {object} - Object with gradient and shadow styles
 */
export function getTagColor(tagName) {
  const index = hashString(tagName) % TAG_GRADIENTS.length;
  return TAG_GRADIENTS[index];
}

/**
 * Get a truly random tag color (different each time)
 * @returns {object} - Object with gradient and shadow styles
 */
export function getRandomTagColor() {
  const index = Math.floor(Math.random() * TAG_GRADIENTS.length);
  return TAG_GRADIENTS[index];
}

/**
 * Get tag colors for an array of tags
 * @param {string[]} tags - Array of tag names
 * @param {boolean} useRandom - Whether to use random colors or consistent colors
 * @returns {object} - Object mapping tag names to color objects
 */
export function getTagColors(tags, useRandom = false) {
  const colorMap = {};
  
  if (useRandom) {
    // Create a shuffled array of available colors
    const shuffledColors = [...TAG_GRADIENTS].sort(() => Math.random() - 0.5);
    
    tags.forEach((tag, index) => {
      // Cycle through colors if there are more tags than colors
      colorMap[tag] = shuffledColors[index % shuffledColors.length];
    });
  } else {
    // Use consistent hashing for each tag
    tags.forEach(tag => {
      colorMap[tag] = getTagColor(tag);
    });
  }
  
  return colorMap;
}

/**
 * Apply tag colors to a DOM element using CSS custom properties
 * @param {HTMLElement} element - The DOM element to style
 * @param {object} colorObj - Color object from getTagColor or getRandomTagColor
 */
export function applyTagColor(element, colorObj) {
  element.style.setProperty('--tag-gradient', colorObj.gradient);
  element.style.setProperty('--tag-shadow', colorObj.shadow);
  element.style.setProperty('--tag-shadow-hover', colorObj.shadowHover);
}
