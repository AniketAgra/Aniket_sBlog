import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Accessible, headless select menu with Tailwind styling.
 * Props:
 * - options: Array<{ value: string, label: string }>
 * - value: string
 * - onChange: (value: string) => void
 * - srLabel?: string (for screen readers)
 * - className?: string (wrapper)
 */
export default function SelectMenu({ options, value, onChange, srLabel = 'Select', className = '' }) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const wrapRef = useRef(null);

  const selectedIndex = useMemo(() => Math.max(0, options.findIndex(o => String(o.value) === String(value))), [options, value]);
  const selected = options[selectedIndex] || options[0];

  useEffect(() => {
    if (!open) return;
    setHighlight(selectedIndex);
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (!open) return;
      const max = options.length - 1;
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        btnRef.current?.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight((h) => (h >= max ? 0 : h + 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight((h) => (h <= 0 ? max : h - 1));
      } else if (e.key === 'Home') {
        e.preventDefault();
        setHighlight(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        setHighlight(max);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const opt = options[highlight] || selected;
        onChange(opt.value);
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, options, selected, selectedIndex, onChange, highlight]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-index="${highlight}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, highlight]);

  const listboxId = useMemo(() => `sel-${Math.random().toString(36).slice(2, 8)}`, []);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <span className="sr-only">{srLabel}</span>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen(o => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ') {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-gray-200 shadow-sm transition-colors hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40"
      >
        <span className="whitespace-nowrap">{selected?.label}</span>
        <svg className={`h-4 w-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          id={listboxId}
          ref={listRef}
          aria-activedescendant={`${listboxId}-opt-${highlight}`}
          className="absolute right-0 z-30 mt-2 max-h-60 min-w-[10rem] overflow-auto rounded-lg border border-white/10 bg-[#0b0b10]/95 p-1 ring-1 ring-black/0 shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-[#0b0b10]/70"
        >
          {options.map((opt, i) => {
            const active = i === highlight;
            const selected = String(opt.value) === String(value);
            return (
              <div
                key={opt.value}
                id={`${listboxId}-opt-${i}`}
                data-index={i}
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => { e.preventDefault(); }}
                onClick={() => { onChange(opt.value); setOpen(false); btnRef.current?.focus(); }}
                className={`flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm text-gray-200 transition-colors ${active ? 'bg-white/10' : 'hover:bg-white/5'} ${selected ? 'text-white' : ''}`}
              >
                <span className="truncate">{opt.label}</span>
                {selected && (
                  <svg className="ml-2 h-4 w-4 text-fuchsia-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-7.5 9a.75.75 0 01-1.127.04l-3.5-3.75a.75.75 0 011.098-1.023l2.88 3.086 6.964-8.355a.75.75 0 011.042-.05z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

SelectMenu.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  srLabel: PropTypes.string,
  className: PropTypes.string,
};
