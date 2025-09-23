import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';

export default function ProjectCard({ project, variant = 'grid' }) {
  // Helper to truncate long descriptions with an ellipsis
  const truncate = (text, limit = 100) => {
    if (!text) return '';
    const s = String(text);
    return s.length > limit ? s.slice(0, Math.max(0, limit - 1)).trimEnd() + '…' : s;
  };

  const uniqueTags = useMemo(() => {
    const arr = [
      ...(Array.isArray(project?.languages) ? project.languages : []),
      ...(Array.isArray(project?.tags) ? project.tags : []),
    ]
      .map((t) => String(t).trim())
      .filter(Boolean);
    const uniqLower = [...new Set(arr.map((t) => t.toLowerCase()))];
    return uniqLower.map((t) => t.charAt(0).toUpperCase() + t.slice(1));
  }, [project?.languages, project?.tags]);

  const to = project._id ? `/projects/${project._id}` : `/projects/${project.slug}`;

  if (variant === 'list') {
    return (
  <article className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur">
        {project.coverImageUrl && (
          <Link to={to} className="block shrink-0">
            <img src={project.coverImageUrl} alt={project.title} className="h-20 w-20 rounded-md object-cover" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <Link to={to} className="hover:underline">
            <h3 className="truncate text-sm font-semibold sm:text-base">{project.title}</h3>
          </Link>
          {project.tagline && (
            <p className="mt-1 text-xs text-gray-300 sm:text-sm">
              {truncate(project.tagline, 110)}
            </p>
          )}
          {uniqueTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {uniqueTags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] text-fuchsia-200 ring-1 ring-inset ring-fuchsia-400/20">{tag}</span>
              ))}
            </div>
          )}
          <div className="mt-2 flex gap-3 text-xs text-cyan-300 sm:text-sm">
            {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="hover:underline">Demo</a>}
            {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="hover:underline">Repo</a>}
          </div>
        </div>
      </article>
    );
  }

  return (
  <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <Link to={to} className="block">
        {project.coverImageUrl && <img src={project.coverImageUrl} alt={project.title} className="h-36 w-full object-cover sm:h-40" />}
        <div className="px-3 py-3 sm:px-4">
          <div className="text-[10px] text-gray-400">{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : ''}</div>
          <h3 className="mt-1 text-base font-bold leading-snug sm:text-[1.05rem]">{project.title}</h3>
          {project.tagline && (
            <p className="mt-1.5 text-sm text-gray-300">
              {truncate(project.tagline, 90)}
            </p>
          )}
          {uniqueTags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {uniqueTags.slice(0, 5).map((tag) => (
                <span key={tag} className="rounded-full bg-fuchsia-500/10 px-2 py-0.5 text-[10px] text-fuchsia-200 ring-1 ring-inset ring-fuchsia-400/20">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </Link>
      <div className="-mt-2 flex items-center gap-3 px-3 pb-3 text-sm sm:px-4">
        {project.demoUrl && <a href={project.demoUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Demo</a>}
        {project.repoUrl && <a href={project.repoUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:underline">Repo</a>}
      </div>
    </article>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    _id: PropTypes.string,
    slug: PropTypes.string,
    title: PropTypes.string.isRequired,
    tagline: PropTypes.string,
    coverImageUrl: PropTypes.string,
    createdAt: PropTypes.string,
    languages: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    demoUrl: PropTypes.string,
    repoUrl: PropTypes.string,
  }).isRequired,
  variant: PropTypes.oneOf(['grid', 'list']),
};
