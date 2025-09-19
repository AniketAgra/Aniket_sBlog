import { useState } from 'react';
import GlassCard from './admin/GlassCard';
import SectionHeader from './admin/SectionHeader';
import Editor from './admin/Editor';
import PublishBar from './admin/PublishBar';
import ImageUpload from './admin/ImageUpload';

export default function AdminCreateProject() {
  const [form, setForm] = useState({ title: '', tagline: '', tags: '', languages: '', coverImageUrl: '', content: '', demoUrl: '', repoUrl: '' });
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.id]: e.target.value }));

  const uploadImage = async () => {
    if (!image) return null;
    const fd = new FormData();
    fd.append('image', image);
    const res = await fetch('/api/upload', { method: 'POST', body: fd, credentials: 'include' });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Upload failed');
    return data.url;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      let cover = form.coverImageUrl;
      if (image) cover = await uploadImage();
      const body = {
        title: form.title,
        tagline: form.tagline,
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
        content: form.content,
        coverImageUrl: cover || undefined,
        demoUrl: form.demoUrl || undefined,
        repoUrl: form.repoUrl || undefined,
      };
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to create project');
      setStatus({ loading: false, error: null, success: 'Project created' });
      setForm({ title: '', tagline: '', tags: '', languages: '', coverImageUrl: '', content: '', demoUrl: '', repoUrl: '' });
      setImage(null);
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null });
    }
  };

  return (
    <div>
      <SectionHeader title="Create Project" subtitle="Showcase your work with style" />
      <form className="grid gap-5" onSubmit={onSubmit}>
        <GlassCard>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-200">Title</label>
              <input id="title" value={form.title} onChange={onChange} required className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="tagline" className="mb-2 block text-sm font-medium text-gray-200">Tagline</label>
              <input id="tagline" value={form.tagline} onChange={onChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
            <div>
              <label htmlFor="tags" className="mb-2 block text-sm font-medium text-gray-200">Tags</label>
              <input id="tags" value={form.tags} onChange={onChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
            <div>
              <label htmlFor="languages" className="mb-2 block text-sm font-medium text-gray-200">Languages</label>
              <input id="languages" value={form.languages} onChange={onChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
            <div>
              <label htmlFor="demoUrl" className="mb-2 block text-sm font-medium text-gray-200">Demo URL</label>
              <input id="demoUrl" value={form.demoUrl} onChange={onChange} placeholder="https://demo.example" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
            <div>
              <label htmlFor="repoUrl" className="mb-2 block text-sm font-medium text-gray-200">Repository URL</label>
              <input id="repoUrl" value={form.repoUrl} onChange={onChange} placeholder="https://github.com/..." className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="coverImageUrl" className="mb-2 block text-sm font-medium text-gray-200">Cover Image URL (optional)</label>
              <input id="coverImageUrl" value={form.coverImageUrl} onChange={onChange} className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 focus:border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/20" />
            </div>
          </div>
        </GlassCard>

        <ImageUpload image={image} onFile={setImage} />

        <Editor label="Description" value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} />

        <PublishBar loading={status.loading} label="Publish Project" onClick={onSubmit} />
        {status.error && <p className="text-red-400 text-sm">{status.error}</p>}
        {status.success && <p className="text-emerald-400 text-sm">{status.success}</p>}
      </form>
    </div>
  );
}
