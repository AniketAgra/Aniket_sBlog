// Gradient utility functions

// Gradient palettes for dynamic styling
export const CHIP_GRADIENTS = [
  'from-cyan-500 via-violet-500 to-fuchsia-500',
  'from-emerald-500 via-teal-500 to-cyan-500',
  'from-amber-500 via-orange-500 to-rose-500',
  'from-indigo-500 via-purple-500 to-pink-500',
  'from-sky-500 via-blue-500 to-indigo-500',
  'from-fuchsia-500 via-rose-500 to-orange-500',
  'from-lime-500 via-emerald-500 to-teal-500',
  'from-violet-500 via-fuchsia-500 to-rose-500',
  'from-rose-500 via-orange-500 to-yellow-500',
  'from-teal-400 via-cyan-500 to-blue-500',
];

export const CARD_BORDER_GRADIENTS = [
  'from-emerald-400/40 via-violet-400/40 to-pink-400/40',
  'from-cyan-400/40 via-blue-400/40 to-indigo-400/40',
  'from-rose-400/40 via-orange-400/40 to-amber-400/40',
  'from-fuchsia-400/40 via-violet-400/40 to-sky-400/40',
  'from-teal-400/40 via-emerald-400/40 to-lime-400/40',
  'from-purple-400/40 via-pink-400/40 to-rose-400/40',
  'from-yellow-400/40 via-amber-400/40 to-orange-400/40',
  'from-blue-400/40 via-indigo-400/40 to-violet-400/40',
];

/**
 * Generate a hash from a string for consistent gradient selection
 * @param {string} str - The string to hash
 * @returns {number} - A positive integer hash
 */
export function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0; // Convert to 32-bit integer
  }
  return Math.abs(h);
}

/**
 * Pick a gradient from a palette based on a key
 * @param {string[]} palette - Array of gradient class names
 * @param {string|number} key - Key to determine which gradient to pick
 * @returns {string} - Selected gradient class name
 */
export function pickGradient(palette, key) {
  if (!palette.length) return '';
  const idx = hashString(String(key || '')) % palette.length;
  return palette[idx];
}

/**
 * Get a chip gradient based on a key
 * @param {string|number} key - Key to determine which gradient to pick
 * @returns {string} - Selected chip gradient class name
 */
export function getChipGradient(key) {
  return pickGradient(CHIP_GRADIENTS, key);
}

/**
 * Get a card border gradient based on a key
 * @param {string|number} key - Key to determine which gradient to pick
 * @returns {string} - Selected card border gradient class name
 */
export function getCardBorderGradient(key) {
  return pickGradient(CARD_BORDER_GRADIENTS, key);
}
