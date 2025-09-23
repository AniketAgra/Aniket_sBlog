import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import styles from '../styles/components/CommentsList.module.css';
import SignInPrompt from './SignInPrompt';
import ConfirmModal from './ConfirmModal';

// Generic comments widget for posts and projects
// Recursive comment node: renders a comment and its nested replies
function CommentNode({ node, derivedUsername, depth = 0, replyingTo, currentUser, onDeleted }) {
  const [liked, setLiked] = useState(!!node.liked);
  const [likes, setLikes] = useState(typeof node.likes === 'number' ? node.likes : 0);
  const [showReplyBox, setShowReplyBox] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState(null);
  const [showReplies, setShowReplies] = useState(false);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [replies, setReplies] = useState([]);
  const [repliesPage, setRepliesPage] = useState(1);
  const [repliesTotal, setRepliesTotal] = useState(node.repliesCount || 0);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(node.text || '');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const currentUserId = currentUser?._id || currentUser?.id;
  const canManage = !!(currentUser && (currentUser?.role === 'admin' || (node.userId && String(node.userId) === String(currentUserId))));

  const onToggleLike = async () => {
    // optimistic
    setLiked((prev) => !prev);
    setLikes((prev) => prev + (liked ? -1 : 1));
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(node._id)}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to like');
      setLikes(data.likes || 0);
      setLiked(!!data.liked);
    } catch (_) {
      // revert
      setLiked((prev) => !prev);
      setLikes((prev) => prev + (liked ? -1 : 1));
    }
  };

  const ensureRepliesLoaded = async () => {
    if (repliesLoaded || repliesLoading) return;
    setRepliesLoading(true);
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(node._id)}/replies?limit=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to load replies');
      const items = (data.items || []).map((r) => ({ ...r, likes: r.likes || 0, liked: !!r.liked }));
      setReplies(items);
      setRepliesLoaded(true);
      setRepliesLoading(false);
      setRepliesPage(1);
      setRepliesTotal(typeof data.total === 'number' ? data.total : items.length);
    } catch (_) {
      setRepliesLoading(false);
    }
  };

  const toggleReplies = async () => {
    if (!showReplies && !repliesLoaded) {
      await ensureRepliesLoaded();
    }
    setShowReplies((s) => !s);
  };

  const loadMoreReplies = async () => {
    setRepliesLoading(true);
    try {
      const nextPage = (repliesPage || 1) + 1;
      const res = await fetch(`/api/comments/${encodeURIComponent(node._id)}/replies?page=${nextPage}&limit=50`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to load replies');
      const more = (data.items || []).map((r) => ({ ...r, likes: r.likes || 0, liked: !!r.liked }));
      setReplies((prev) => [...prev, ...more]);
      setRepliesPage(nextPage);
      setRepliesLoading(false);
    } catch (_) {
      setRepliesLoading(false);
    }
  };

  const submitReply = async (e) => {
    e?.preventDefault?.();
    const text = (replyText || '').trim();
    if (!text || !derivedUsername) return;
    setReplySubmitting(true);
    setReplyError(null);
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(node._id)}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: derivedUsername, text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to post reply');
      const reply = { ...data, likes: 0, liked: false };
      setReplies((prev) => [reply, ...prev]);
      setRepliesTotal((n) => (n || 0) + 1);
      setShowReplies(true);
      setRepliesLoaded(true);
      setReplyText('');
      setReplySubmitting(false);
    } catch (err) {
      setReplySubmitting(false);
      setReplyError(err.message || 'Failed to reply');
    }
  };

  const bodyWithMention = () => {
    const name = replyingTo || '';
    const alreadyTagged = name && (node.text || '').trim().toLowerCase().startsWith(`@${String(name).toLowerCase()}`);
    if (depth > 0 && name && !alreadyTagged) {
      return (
        <p className={styles.body}>
          <span className={styles.mention}>@{name}</span> {node.text}
        </p>
      );
    }
    return <p className={styles.body}>{node.text}</p>;
  };

  const parseJsonSafe = async (res) => {
    try {
      return await res.json();
    } catch (_) {
      try {
        const text = await res.text();
        // Some hosts return HTML error pages; surface first line
        return { message: text?.slice(0, 200) };
      } catch {
        return { message: 'Unexpected response' };
      }
    }
  };

  const onSaveEdit = async (e) => {
    e?.preventDefault?.();
    const text = (editText || '').trim();
    if (!text) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      // Prefer PUT; fall back to POST alias if needed
      let res = await fetch(`/api/comments/${encodeURIComponent(node._id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text }),
      });
      let data = await parseJsonSafe(res);
      if (!res.ok) {
        // Retry via POST alias to bypass proxies blocking PUT
        res = await fetch(`/api/comments/${encodeURIComponent(node._id)}/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ text }),
        });
        data = await parseJsonSafe(res);
      }
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to update');
      // Update local node view
      setReplyError(null);
      setEditing(false);
      setEditSubmitting(false);
      // reflect text & edited flags
      node.text = data.text;
      node.edited = !!data.edited;
      node.editedAt = data.editedAt;
    } catch (err) {
      setEditSubmitting(false);
      setEditError(err.message || 'Failed to update');
    }
  };

  const doDelete = async () => {
    setDeleteSubmitting(true);
    try {
      let res = await fetch(`/api/comments/${encodeURIComponent(node._id)}`, { method: 'DELETE', credentials: 'include' });
      let data = await parseJsonSafe(res);
      if (!res.ok) {
        // Fallback via POST alias in case DELETE is blocked
        res = await fetch(`/api/comments/${encodeURIComponent(node._id)}/delete`, { method: 'POST', credentials: 'include' });
        data = await parseJsonSafe(res);
      }
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to delete');
      setDeleteSubmitting(false);
      setShowDeleteModal(false);
      if (typeof onDeleted === 'function') onDeleted(node._id);
    } catch (err) {
      setDeleteSubmitting(false);
      // Minimal inline surfacing; you could add toast system
      window.alert(err.message || 'Failed to delete');
    }
  };

  const onDelete = () => setShowDeleteModal(true);

  return (
    <div>
      <div className={styles.head}>
        <img
          className={styles.avatar}
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(node.username || 'User')}&background=372554&color=fff`}
          alt={node.username || 'User'}
        />
        <div className={styles.meta}>
          <strong>{node.username || 'Anonymous'}</strong>
          <span className={styles.date}>
            {new Date(node.createdAt).toLocaleString()}
            {(node.edited || node.editedAt) && <span className={styles.editedTag} title={node.editedAt ? new Date(node.editedAt).toLocaleString() : 'Edited'}>Edited</span>}
          </span>
        </div>
      </div>
      {!editing ? (
        bodyWithMention()
      ) : (
        <form onSubmit={onSaveEdit} style={{ marginTop: '.5rem' }}>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{ flex: 1, padding: '.45rem .6rem', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '.5rem', color: '#e5e7eb' }}
              required
            />
            <button type="submit" disabled={editSubmitting || !(editText || '').trim()} className={styles.button || ''} style={{ padding: '.45rem .8rem' }}>
              {editSubmitting ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => { setEditing(false); setEditText(node.text || ''); }} style={{ padding: '.45rem .8rem', background: 'transparent', border: '1px solid rgba(255,255,255,.15)', color: '#9ca3af', borderRadius: '.4rem' }}>
              Cancel
            </button>
          </div>
          {editError && <div className={styles.error} style={{ marginTop: '.25rem' }}>Failed to update: {editError}</div>}
        </form>
      )}

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '.35rem' }}>
        <button
          type="button"
          onClick={onToggleLike}
          title={liked ? 'Unlike' : 'Like'}
          className={`${styles.likeBtn} ${liked ? styles.heartActive : ''}`}
        >
          {/* Outline heart that fills when liked */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 21s-6.716-4.438-9.243-7.273C.615 11.32 1.028 7.97 3.343 6.15a5 5 0 016.657.516L12 8.8l2-2.134a5 5 0 016.657-.516c2.315 1.82 2.728 5.17.586 7.577C18.716 16.562 12 21 12 21z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <span className={styles.likeCount}>{likes || 0}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowReplyBox((s) => !s);
            if (!showReplyBox && depth >= 1 && !replyText) {
              setReplyText(`@${node.username} `);
            }
          }}
          style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
        >
          Reply
        </button>

        {canManage && !editing && (
          <>
            <button
              type="button"
              onClick={() => { setEditing(true); setEditText(node.text || ''); }}
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
            >
              Edit
            </button>
            <button
              type="button"
              disabled={deleteSubmitting}
              onClick={onDelete}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
            >
              {deleteSubmitting ? 'Deleting…' : 'Delete'}
            </button>
          </>
        )}

        {!!repliesTotal && (
          <button
            type="button"
            onClick={toggleReplies}
            style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
          >
            {showReplies ? 'Hide' : 'View'} replies ({repliesTotal})
          </button>
        )}
      </div>

      {showReplyBox && (
        <form onSubmit={submitReply} style={{ marginTop: '.5rem' }}>
          <div style={{ display: 'flex', gap: '.5rem' }}>
            <input
              type="text"
              placeholder={`Reply as ${derivedUsername}`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              style={{ flex: 1, padding: '.45rem .6rem', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '.5rem', color: '#e5e7eb' }}
              required
            />
            <button type="submit" disabled={replySubmitting || !(replyText || '').trim()} className={styles.button || ''} style={{ padding: '.45rem .8rem' }}>
              {replySubmitting ? 'Replying…' : 'Reply'}
            </button>
          </div>
          {replyError && <div className={styles.error} style={{ marginTop: '.25rem' }}>Failed to reply: {replyError}</div>}
        </form>
      )}

      {showReplies && (
        depth === 0 ? (
          <div style={{ marginTop: '.5rem', paddingLeft: '2.25rem', borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
            {repliesLoading && <div className={styles.loading}>Loading replies…</div>}
            {!!replies.length && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
                {replies.map((r) => (
                  <li key={r._id} style={{ padding: '.35rem 0' }}>
                    <CommentNode
                      node={r}
                      derivedUsername={derivedUsername}
                      depth={depth + 1}
                      replyingTo={node.username}
                      currentUser={currentUser}
                      onDeleted={(id) => setReplies((prev) => prev.filter((x) => x._id !== id))}
                    />
                  </li>
                ))}
              </ul>
            )}
            {replies.length < (repliesTotal || 0) && (
              <button
                type="button"
                onClick={loadMoreReplies}
                style={{ marginTop: '.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,.15)', color: '#9ca3af', padding: '.35rem .6rem', borderRadius: '.4rem', cursor: 'pointer' }}
              >
                Load more replies
              </button>
            )}
          </div>
        ) : (
          <>
            {repliesLoading && <div className={styles.loading}>Loading replies…</div>}
            {!!replies.length && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '.5rem' }}>
                {replies.map((r) => (
                  <li key={r._id} style={{ padding: '.35rem 0' }}>
                    <CommentNode
                      node={r}
                      derivedUsername={derivedUsername}
                      depth={depth + 1}
                      replyingTo={node.username}
                      currentUser={currentUser}
                      onDeleted={(id) => setReplies((prev) => prev.filter((x) => x._id !== id))}
                    />
                  </li>
                ))}
              </ul>
            )}
            {replies.length < (repliesTotal || 0) && (
              <button
                type="button"
                onClick={loadMoreReplies}
                style={{ marginTop: '.5rem', background: 'transparent', border: '1px solid rgba(255,255,255,.15)', color: '#9ca3af', padding: '.35rem .6rem', borderRadius: '.4rem', cursor: 'pointer' }}
              >
                Load more replies
              </button>
            )}
          </>
        )
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={showDeleteModal}
        title="Delete comment?"
        message="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={doDelete}
        busy={deleteSubmitting}
      />
    </div>
  );
}

CommentNode.propTypes = {
  node: PropTypes.object.isRequired,
  derivedUsername: PropTypes.string,
  depth: PropTypes.number,
  replyingTo: PropTypes.string,
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    _id: PropTypes.string,
    role: PropTypes.string,
  }),
  onDeleted: PropTypes.func,
};

export default function CommentsList({ entityKey, entityType = 'post' }) {
  const currentUser = useSelector((s) => s.user?.currentUser);
  const [state, setState] = useState({ items: [], total: 0, loading: true, error: null });
  const [form, setForm] = useState({ text: '', submitting: false, error: null });

  const derivedUsername = useMemo(() => {
    if (!currentUser) return null;
    return (
      currentUser.name ||
      currentUser.username ||
      currentUser.email?.split('@')[0] ||
      'User'
    );
  }, [currentUser]);

  useEffect(() => {
    let active = true;
    // Only fetch when we have an entity key and user is authenticated (gated upstream, but keep safe)
    if (!entityKey) return undefined;
    (async () => {
      try {
        const base = entityType === 'project' ? '/api/projects' : '/api/posts';
        const res = await fetch(`${base}/${encodeURIComponent(entityKey)}/comments?limit=50`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to fetch comments');
        // Augment comments with UI state for likes/replies without mutating server shape
        const items = (data.items || []).map((c) => ({
          ...c,
          likes: typeof c.likes === 'number' ? c.likes : 0,
          liked: !!c.liked,
        }));
        if (active) setState({ items, total: data.total || (Array.isArray(data) ? data.length : 0), loading: false, error: null });
      } catch (e) {
        if (active) setState({ items: [], total: 0, loading: false, error: e.message });
      }
    })();
    return () => { active = false; };
  }, [entityKey, entityType]);

  const submit = async (e) => {
    e?.preventDefault?.();
    if (!entityKey || !form.text.trim()) return;
    if (!derivedUsername) {
      setForm((p) => ({ ...p, error: 'Please sign in to comment.' }));
      return;
    }
    try {
      setForm((p) => ({ ...p, submitting: true, error: null }));
      const base = entityType === 'project' ? '/api/projects' : '/api/posts';
      const res = await fetch(`${base}/${encodeURIComponent(entityKey)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: derivedUsername, text: form.text.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to post comment');
      const newItem = {
        ...data,
        likes: 0,
        liked: false,
        showReplies: false,
        repliesLoaded: false,
        repliesLoading: false,
        replies: [],
        replyText: '',
        replySubmitting: false,
        replyError: null,
      };
      setState((s) => ({ ...s, items: [newItem, ...s.items], total: (s.total || 0) + 1 }));
      setForm({ text: '', submitting: false, error: null });
    } catch (err) {
      setForm((p) => ({ ...p, submitting: false, error: err.message }));
    }
  };

  // per-comment actions are handled inside CommentNode recursively now

  if (state.loading) return <div className={styles.loading}>Loading comments…</div>;
  if (state.error) return <div className={styles.error}>Failed to load comments: {state.error}</div>;

  // Fallback prompt if somehow rendered without auth (should be gated by detail pages)
  if (!currentUser) {
    return <SignInPrompt message={entityType === 'project' ? 'Sign in to view and comment on this project.' : 'Sign in to view and comment on this post.'} />;
  }

  return (
    <section id="comments" className={styles.section} aria-labelledby="comments-title">
      <h2 id="comments-title" className={styles.title}>Comments ({state.total})</h2>

      {/* Add comment form */}
      <form onSubmit={submit} style={{ marginBottom: '.75rem' }}>
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem' }}>
          <input
            type="text"
            placeholder="Write a comment…"
            value={form.text}
            onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
            style={{ flex: 1, padding: '.5rem .6rem', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '.5rem', color: '#e5e7eb' }}
            required
          />
          <button type="submit" disabled={form.submitting || !form.text.trim()} className={styles.button || ''} style={{ padding: '.5rem .8rem' }}>
            {form.submitting ? 'Posting…' : 'Post'}
          </button>
        </div>
        <div style={{ color: '#9ca3af', fontSize: '.9rem', marginBottom: '.25rem' }}>Commenting as <strong>{derivedUsername}</strong></div>
        {form.error && <div className={styles.error}>Failed to post: {form.error}</div>}
      </form>

      {!!state.items.length && (
        <ul className={styles.list}>
          {state.items.map((c) => (
            <li key={c._id} className={styles.item}>
              <CommentNode
                node={c}
                derivedUsername={derivedUsername}
                depth={0}
                currentUser={currentUser}
                onDeleted={(id) => setState((s) => ({ ...s, items: s.items.filter((x) => x._id !== id), total: Math.max((s.total||1)-1,0) }))}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

CommentsList.propTypes = {
  entityKey: PropTypes.string.isRequired,
  entityType: PropTypes.oneOf(['post', 'project']),
};
