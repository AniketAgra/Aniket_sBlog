import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SectionHeader from './SectionHeader';
import Editor from './Editor';
import PublishBar from './PublishBar';
import ImageUpload from './ImageUpload';
import GlassCard from './GlassCard';

export default function EditProject({ id }) {
  const [form, setForm] = useState(null);
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);

  useEffect(() => {
    let abort = false;
  (async () => {
      try {
    const res = await fetch(`/api/projects/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load project');
        const json = await res.json();
        if (!abort) {
          setForm({
            title: json.title || '',
            tagline: json.tagline || '',
            tags: Array.isArray(json.tags) ? json.tags.join(', ') : '',
            languages: Array.isArray(json.languages) ? json.languages.join(', ') : '',
            coverImageUrl: json.coverImageUrl || '',
            content: json.content || '',
            demoUrl: json.demoUrl || '',
            repoUrl: json.repoUrl || '',
      status: json.status || 'published',
          });
        }
      } catch (e) {
        if (!abort) setStatus((s) => ({ ...s, error: e.message }));
      }
    })();
    return () => { abort = true; };
  }, [id]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const uploadImage = async () => {
    if (!image) return null;
    setImageUploading(true);
    setImageUploadError(null);
    setImageUploadProgress(null);
    try {
      const fd = new FormData();
      fd.append('file', image);
      fd.append('upload_preset', import.meta.env.VITE_UPLOAD_PRESET);
      fd.append('cloud_name', 'dwtgjddna');
      await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', import.meta.env.VITE_CLOUDINARY_URL, true);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setImageUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              const url = data.secure_url || data.url;
              setForm((f) => ({ ...f, coverImageUrl: url }));
              setImageUploadProgress(100);
              setImageUploading(false);
              resolve(url);
            } catch (e) { reject(e); }
          } else {
            reject(new Error('Failed to upload image'));
          }
        };
        xhr.onerror = () => reject(new Error('Failed to upload image'));
        xhr.send(fd);
      });
    } catch (err) {
      setImageUploadError('Failed to upload image. Please try again.');
      setImageUploadProgress(null);
      setImageUploading(false);
      throw err;
    }
  };

  useEffect(() => {
    if (image) uploadImage().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const submitWithStatus = async (nextStatus, e) => {
    e.preventDefault();
    if (!form) return;
    setStatus({ loading: true, error: null, success: null });
    try {
      if (imageUploading) throw new Error('Please wait until image upload completes.');
      if (image && !form.coverImageUrl) await uploadImage();
      const body = {
        title: form.title,
        tagline: form.tagline,
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
        content: form.content,
        coverImageUrl: form.coverImageUrl || undefined,
        demoUrl: form.demoUrl || undefined,
        repoUrl: form.repoUrl || undefined,
        ...(nextStatus ? { status: nextStatus } : {}),
      };
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to update project');
      const successMsg = nextStatus === 'draft' ? 'Draft updated' : nextStatus === 'published' ? 'Project published' : 'Project updated';
      setStatus({ loading: false, error: null, success: successMsg });
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null });
    }
  };

  const onSubmit = (e) => submitWithStatus(undefined, e);
  const onSaveDraft = (e) => submitWithStatus('draft', e);
  const onPublish = (e) => submitWithStatus('published', e);

  if (!form) return (
    <div>
      <SectionHeader title="Edit Project" />
      <p className="text-sm text-gray-500">Loading…</p>
    </div>
  );

  return (
    <div>
      <SectionHeader title="Edit Project" subtitle="Update content and republish" />
      <form className="grid gap-5" onSubmit={onSubmit}>
        <GlassCard>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-200">Project Title</label>
              <input id="title" value={form.title} onChange={onChange} required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="tagline" className="mb-2 block text-sm font-medium text-gray-200">Tagline</label>
              <input id="tagline" value={form.tagline} onChange={onChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            </div>
            <div>
              <label htmlFor="tags" className="mb-2 block text-sm font-medium text-gray-200">Tags</label>
              <input id="tags" value={form.tags} onChange={onChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            </div>
            <div>
              <label htmlFor="languages" className="mb-2 block text-sm font-medium text-gray-200">Languages</label>
              <input id="languages" value={form.languages} onChange={onChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            </div>
            <div>
              <label htmlFor="demoUrl" className="mb-2 block text-sm font-medium text-gray-200">Demo URL</label>
              <input id="demoUrl" value={form.demoUrl} onChange={onChange} placeholder="https://demo.example" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 placeholder:text-gray-500" />
            </div>
            <div>
              <label htmlFor="repoUrl" className="mb-2 block text-sm font-medium text-gray-200">Repository URL</label>
              <input id="repoUrl" value={form.repoUrl} onChange={onChange} placeholder="https://github.com/..." className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 placeholder:text-gray-500" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="coverImageUrl" className="mb-2 block text-sm font-medium text-gray-200">Cover Image URL</label>
              <input id="coverImageUrl" value={form.coverImageUrl} onChange={onChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3" />
            </div>
          </div>
        </GlassCard>
        <ImageUpload image={image} onFile={setImage} progress={imageUploadProgress} uploading={imageUploading} error={imageUploadError} />
        <Editor value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} />
  <PublishBar loading={status.loading} label={form.status === 'draft' ? 'Publish' : 'Save Changes'} onClick={form.status === 'draft' ? onPublish : onSubmit} onDraft={onSaveDraft} draftLabel="Save Draft Changes" />
        {status.error && <p className="text-red-400 text-sm">{status.error}</p>}
        {status.success && <p className="text-emerald-400 text-sm">{status.success}</p>}
      </form>
    </div>
  );
}

EditProject.propTypes = {
  id: PropTypes.string.isRequired,
};
