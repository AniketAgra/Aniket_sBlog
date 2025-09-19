import GlassCard from './GlassCard';
import PropTypes from 'prop-types';

export default function ImageUpload({ image, onFile, hint = 'Upload image' }) {
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
        </div>
      </div>
    </GlassCard>
  );
}

ImageUpload.propTypes = {
  image: PropTypes.object,
  onFile: PropTypes.func.isRequired,
  hint: PropTypes.string,
};
