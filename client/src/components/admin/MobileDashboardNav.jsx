import { useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

export default function MobileDashboardNav(){
  const { currentUser } = useSelector(s=>s.user);
  const isAdmin = currentUser?.role === 'admin';
  const path = useLocation().pathname + useLocation().search;

  if(!currentUser) return null;
  return (
    <div className="md:hidden mb-4 grid grid-cols-2 gap-2">
      <Link to="/dashboard?tab=profile" className={`rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm ${path.includes('profile')?'ring-2 ring-indigo-500/40':''}`}>Profile</Link>
      {isAdmin && <Link to="/dashboard?tab=subscribers" className={`rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm ${path.includes('subscribers')?'ring-2 ring-indigo-500/40':''}`}>Subscribers</Link>}
      {isAdmin && <Link to="/dashboard?tab=resume-downloads" className={`rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm ${path.includes('resume-downloads')?'ring-2 ring-indigo-500/40':''}`}>Resume Downloads</Link>}
      {isAdmin && <Link to="/dashboard?tab=create-post" className={`rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm ${path.includes('create-post')?'ring-2 ring-indigo-500/40':''}`}>Create Post</Link>}
      {isAdmin && <Link to="/dashboard?tab=create-project" className={`rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm ${path.includes('create-project')?'ring-2 ring-indigo-500/40':''}`}>Create Project</Link>}
      {isAdmin && <Link to="/dashboard?tab=manage-posts" className={`rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm ${path.includes('manage-posts')?'ring-2 ring-indigo-500/40':''}`}>Manage Posts</Link>}
      {isAdmin && <Link to="/dashboard?tab=manage-projects" className={`rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm ${path.includes('manage-projects')?'ring-2 ring-indigo-500/40':''}`}>Manage Projects</Link>}
    </div>
  );
}
