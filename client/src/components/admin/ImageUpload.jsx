import GlassCard from './GlassCard';
import PropTypes from 'prop-types';

export default function ImageUpload({ image, onFile, hint = 'Upload image', progress, uploading, error }) {
  return (
    <GlassCard className="p-0 overflow-hidden">
      <div className="p-5">
        <div className="mb-2 text-sm text-gray-200">{hint}</div>
        <div className="flex items-center gap-4">
          <label className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-gray-200 hover:bg-black/30 cursor-pointer">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] || null)}
            />
            Choose file
          </label>
          {image && (
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <div className="h-10 w-16 overflow-hidden rounded-md border border-white/10">
                <img src={URL.createObjectURL(image)} alt="preview" className="h-full w-full object-cover" />
              </div>
              <span>{image.name}</span>
            </div>
          )}
          {typeof progress === 'number' && (
            <div className="text-xs text-gray-400">{progress}%</div>
          )}
          {uploading && (
            <div className="h-2 w-32 overflow-hidden rounded bg-white/10">
              <div className="h-full bg-fuchsia-500" style={{ width: `${progress || 0}%` }} />
            </div>
          )}
        </div>
        {error && <div className="mt-2 text-xs text-red-400">{error}</div>}
      </div>
    </GlassCard>
  );
}

ImageUpload.propTypes = {
  image: PropTypes.object,
  onFile: PropTypes.func.isRequired,
  hint: PropTypes.string,
  progress: PropTypes.number,
  uploading: PropTypes.bool,
  error: PropTypes.string,
};
