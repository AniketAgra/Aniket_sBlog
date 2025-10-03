import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import GlassCard from './GlassCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import mdStyles from '../../styles/components/MarkdownContent.module.css';
import { normalizeMarkdownContent } from '../../utils/markdown';

export default function Editor({ label = 'Content', value, onChange, rows = 14 }) {
  const [tab, setTab] = useState('write'); // 'write' | 'preview'

  const normalized = useMemo(() => normalizeMarkdownContent(value || ''), [value]);

  return (
    <GlassCard className="p-0 overflow-hidden">
      {/* Header: label + tabs with slider */}
      <div className="px-5 pt-5">
        <div className="flex items-end justify-between gap-4">
          <label className="block text-sm font-medium text-gray-200">{label}</label>

          <div className="relative w-48 select-none">
            <div className="relative grid grid-cols-2 rounded-full border border-white/10 bg-black/30 p-1 text-xs text-gray-300">
              {/* slider */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-gradient-to-r from-fuchsia-500/20 via-purple-500/20 to-cyan-500/20 ring-1 ring-inset ring-white/10 transition-[left] duration-300"
                style={{ left: tab === 'write' ? '4px' : 'calc(50% + 4px)' }}
              />
              <button
                type="button"
                onClick={() => setTab('write')}
                className={`z-10 rounded-full px-3 py-1 transition ${
                  tab === 'write' ? 'text-white' : 'hover:text-gray-100'
                }`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setTab('preview')}
                className={`z-10 rounded-full px-3 py-1 transition ${
                  tab === 'preview' ? 'text-white' : 'hover:text-gray-100'
                }`}
              >
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 pt-3">
        {tab === 'write' ? (
          <>
            <textarea
              className="h-auto min-h-[240px] w-full resize-y rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-gray-100 placeholder:text-gray-500 focus:border-fuchsia-500/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
              rows={rows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={
                'Write your content in Markdown...\n\nExamples:\n# Heading 1\n\n- Bullet item\n- Another item\n\n```js\nconsole.log(\'code\');\n```'
              }
            />
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>Markdown supported (GFM, fenced code blocks)</span>
              <span>{(value || '').trim().length} chars</span>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <ReactMarkdown
              className={`${mdStyles.markdown} prose max-w-none prose-invert prose-pre:m-0`}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {normalized || '*Nothing to preview yet.*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </GlassCard>
  );
}

Editor.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  rows: PropTypes.number,
};
