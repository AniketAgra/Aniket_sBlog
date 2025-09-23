import { useEffect, useState } from 'react';
import GlassCard from './admin/GlassCard';
import SectionHeader from './admin/SectionHeader';
import Editor from './admin/Editor';
import PublishBar from './admin/PublishBar';
import ImageUpload from './admin/ImageUpload';

export default function AdminCreatePost() {
  const [form, setForm] = useState({ title: '', tagline: '', tags: '', languages: '', coverImageUrl: '', content: '' });
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: null, success: null });
  const [imageUploadError, setImageUploadError] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(null);

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
          if (e.lengthComputable) {
            const p = Math.round((e.loaded / e.total) * 100);
            setImageUploadProgress(p);
          }
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
            } catch (e) {
              reject(e);
            }
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
    if (image) {
      uploadImage().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [image]);

  const submitWithStatus = async (status = 'published', e) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, success: null });
    try {
      // Block if upload in progress
      if (imageUploading) {
        throw new Error('Please wait until image upload completes.');
      }
      // Fallback: if file chosen but URL not set (edge), try uploading now
      let cover = form.coverImageUrl;
      if (image && !cover) {
        await uploadImage();
        cover = form.coverImageUrl;
      }
      const body = {
        title: form.title,
        tagline: form.tagline,
        tags: form.tags.split(',').map((s) => s.trim()).filter(Boolean),
        languages: form.languages.split(',').map((s) => s.trim()).filter(Boolean),
        content: form.content,
        coverImageUrl: cover || undefined,
        status,
      };
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || data?.message || 'Failed to create post');
  const successMsg = status === 'draft' ? 'Saved as draft' : 'Post published';
  setStatus({ loading: false, error: null, success: successMsg });
      setForm({ title: '', tagline: '', tags: '', languages: '', coverImageUrl: '', content: '' });
      setImage(null);
      setImageUploadProgress(null);
      setImageUploadError(null);
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null });
    }
  };

  const onSubmit = (e) => submitWithStatus('published', e);
  const onSaveDraft = (e) => submitWithStatus('draft', e);

  return (
    <div>
      <SectionHeader title="Create New Post" subtitle="Craft a captivating story with a gorgeous editor" />
      <form className="grid gap-5" onSubmit={onSubmit}>
        <GlassCard>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-200">Post Title</label>
              <input id="title" value={form.title} onChange={onChange} required placeholder="Enter a captivating title" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-fuchsia-500/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="tagline" className="mb-2 block text-sm font-medium text-gray-200">Tagline</label>
              <input id="tagline" value={form.tagline} onChange={onChange} placeholder="A short, catchy description" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-fuchsia-500/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20" />
            </div>
            <div>
              <label htmlFor="tags" className="mb-2 block text-sm font-medium text-gray-200">Tags</label>
              <input id="tags" value={form.tags} onChange={onChange} placeholder="nextjs, react, css" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-fuchsia-500/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20" />
            </div>
            <div>
              <label htmlFor="languages" className="mb-2 block text-sm font-medium text-gray-200">Languages</label>
              <input id="languages" value={form.languages} onChange={onChange} placeholder="js, ts" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-fuchsia-500/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="coverImageUrl" className="mb-2 block text-sm font-medium text-gray-200">Cover Image URL (optional)</label>
              <input id="coverImageUrl" value={form.coverImageUrl} onChange={onChange} placeholder="https://…" className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-gray-100 placeholder:text-gray-500 focus:border-fuchsia-500/40 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20" />
            </div>
          </div>
        </GlassCard>

  <ImageUpload image={image} onFile={setImage} progress={imageUploadProgress} uploading={imageUploading} error={imageUploadError} />

        <Editor value={form.content} onChange={(v) => setForm((f) => ({ ...f, content: v }))} />

  <PublishBar loading={status.loading} label="Publish Post" onClick={onSubmit} onDraft={onSaveDraft} draftLabel="Save Draft" />
        {status.error && <p className="text-red-400 text-sm">{status.error}</p>}
        {status.success && <p className="text-emerald-400 text-sm">{status.success}</p>}
      </form>
    </div>
  );
}
