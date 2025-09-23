import { useEffect, useMemo, useRef, useState } from 'react';
import { getProjects } from '../utils/api';

function useDebounced(value, delay = 350) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return v;
}

export default function useProjectsQuery(initial = {}) {
  const [query, setQuery] = useState({ page: 1, limit: 9, sort: 'newest', order: 'desc', view: 'grid', ...initial });
  const debounced = useDebounced({ ...query, page: query.page, q: query.q }, 400);
  const [state, setState] = useState({ items: [], total: 0, page: 1, pageSize: 9, hasMore: false, facets: { tags: [], languages: [] }, loading: true, error: null });
  const abortRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;
    setState((s) => ({ ...s, loading: true, error: null }));
    getProjects({
      page: debounced.page,
      limit: debounced.limit,
      q: debounced.q,
      sort: debounced.sort,
      order: debounced.order,
      languages: debounced.languages,
      tags: debounced.tags,
    })
      .then((res) => {
        setState({
          items: res.items || [],
          total: res.total || 0,
          page: res.page || 1,
          pageSize: res.pageSize || debounced.limit || 9,
          hasMore: !!res.hasMore,
          facets: res.facets || { tags: [], languages: [] },
          loading: false,
          error: null,
        });
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setState((s) => ({ ...s, loading: false, error: e.message || 'Failed to load projects' }));
      });
    return () => controller.abort();
  }, [debounced.page, debounced.limit, debounced.q, debounced.sort, debounced.order, debounced.languages, debounced.tags]);

  const setPage = (page) => setQuery((q) => ({ ...q, page }));
  const setLimit = (limit) => setQuery((q) => ({ ...q, limit, page: 1 }));
  const setSort = (sort) => setQuery((q) => ({ ...q, sort, page: 1 }));
  const setOrder = (order) => setQuery((q) => ({ ...q, order, page: 1 }));
  const setQ = (qText) => setQuery((q) => ({ ...q, q: qText, page: 1 }));
  const toggleFilter = (key, value) => setQuery((q) => {
    const arr = Array.isArray(q[key]) ? q[key] : [];
    const has = arr.includes(value);
    return { ...q, [key]: has ? arr.filter((v) => v !== value) : [...arr, value], page: 1 };
  });
  const clearFilters = () => setQuery((q) => ({ ...q, tags: [], languages: [], page: 1 }));
  const setView = (view) => setQuery((q) => ({ ...q, view }));

  const totalPages = useMemo(() => Math.max(1, Math.ceil((state.total || 0) / (state.pageSize || query.limit || 9))), [state.total, state.pageSize, query.limit]);

  return { query, setQuery, setPage, setLimit, setSort, setOrder, setQ, toggleFilter, clearFilters, setView, totalPages, ...state };
}
