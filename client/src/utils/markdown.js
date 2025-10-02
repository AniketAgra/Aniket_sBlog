// Utilities to normalize slightly malformed markdown copied from various sources
// so that react-markdown can parse it properly (headings, lists, etc.).

/**
 * Normalize markdown text to improve parsing:
 * - Convert CRLF to LF and literal sequences ("\\n") to real newlines
 * - Replace non-breaking/zero-width spaces with normal spaces
 * - Outside fenced code blocks, fix common list/heading issues:
 *   - Ensure a space after '-' or '*' list markers
 *   - Convert bullets like •, – , — to '- '
 *   - Normalize ordered list markers like `1)` or `1-` to `1. `
 *   - Trim excessive leading indentation before headings so `    #` becomes `#`
 */
export function normalizeMarkdownContent(input) {
  if (!input) return '';
  let s = String(input);

  // Convert literal \n/\t to real characters and normalize CRLF
  s = s.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  s = s.replace(/\r\n?/g, '\n');

  // Replace non-breaking and zero-width spaces
  s = s.replace(/[\u00A0\u200B-\u200D\uFEFF]/g, ' ');

  // Process line-by-line, but avoid touching fenced code blocks
  const lines = s.split('\n');
  let inFence = false;
  const fenceRegex = /^\s*```/; // simple fence detector

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (fenceRegex.test(line)) {
      inFence = !inFence; // toggle
      continue;
    }
    if (inFence) continue;

    let l = line;

    // Trim excessive leading spaces before headings (>3) so markdown recognizes them
    l = l.replace(/^( {4,})(#+\s+)/, '$2');

    // Normalize bullet variants to '- '
    l = l.replace(/^\s*[•–—]\s+/, '- ');

    // Ensure a space after '-' or '*' when used as list markers
    l = l.replace(/^(\s*[-*])(\S)/, (_, a, b) => `${a} ${b}`);

    // Normalize ordered list markers like `1)` or `1-` to `1. ` and ensure a space
  l = l.replace(/^(\s*)(\d+)[)-](\S)/, (_, sp, n, after) => `${sp}${n}. ${after}`);
    l = l.replace(/^(\s*)(\d+)\.(\S)/, (_, sp, n, after) => `${sp}${n}. ${after}`);

    // Write back
    lines[i] = l;
  }

  return lines.join('\n');
}

export default normalizeMarkdownContent;
