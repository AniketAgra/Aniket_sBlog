import { HiOutlineEye, HiOutlineHeart, HiOutlineChat } from 'react-icons/hi';
import StatCard from './StatCard';

export default function AnalyticsRow({ stats }) {
  const { views = '125,670', likes = '8,430', comments = '1,204' } = stats || {};
  return (
    <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Total Views" value={views} icon={HiOutlineEye} gradient="from-fuchsia-500 to-purple-500" />
      <StatCard label="Total Likes" value={likes} icon={HiOutlineHeart} gradient="from-rose-500 to-pink-500" />
      <StatCard label="Total Comments" value={comments} icon={HiOutlineChat} gradient="from-cyan-500 to-sky-500" />
    </div>
  );
}
