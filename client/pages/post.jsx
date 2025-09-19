import { useParams, Link } from 'react-router-dom';

const MOCK_POSTS = Array.from({ length: 8 }).map((_, i) => ({
  id: `${i+1}`,
  title: `Designing with Glassmorphism #${i+1}`,
  content: `# Title\n\nThis is a demo post content for article ${i+1}. \n\n- Bullet one\n- Bullet two\n\n> Tip: Replace with real content later.`,
  cover: `https://picsum.photos/seed/blog${i}/1200/600`,
  tags: i % 2 === 0 ? ['UI', 'React'] : ['UX', 'Tailwind'],
  readingTime: `${6 + (i % 3)} min read`,
  date: `2025-0${(i%8)+1}-12`,
  author: { name: 'Aniket', avatar: 'https://picsum.photos/seed/author/120' },
}));

export default function Post(){
  const { id } = useParams();
  const post = MOCK_POSTS.find(p => p.id === id);

  if(!post){
    return <div className="min-h-screen bg-[#0f0c29] text-white flex items-center justify-center">Post not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 shadow-xl">
          <img src={post.cover} alt={post.title} className="w-full object-cover"/>
          <div className="p-6">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <img src={post.author.avatar} className="h-8 w-8 rounded-full"/>
              <span>{post.author.name}</span>
              <span>·</span>
              <span>{post.readingTime}</span>
              <span>·</span>
              <span>{new Date(post.date).toLocaleDateString()}</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold">{post.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {post.tags.map(t => (
                <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-200 border border-purple-500/30">{t}</span>
              ))}
            </div>
            <article className="prose prose-invert max-w-none mt-6">
              {post.content.split('\n').map((line, idx) => <p key={idx}>{line}</p>)}
            </article>
          </div>
        </div>

        {/* Related posts */}
        <div className="mt-10">
          <h3 className="text-xl font-semibold mb-4">Related posts</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {MOCK_POSTS.filter(p=>p.id!==post.id).slice(0,2).map(r => (
              <Link to={`/blog/${r.id}`} key={r.id} className="rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition">
                <img src={r.cover} alt={r.title} className="h-32 w-full object-cover"/>
                <div className="p-3">
                  <div className="text-xs text-gray-300">{r.readingTime}</div>
                  <div className="font-semibold">{r.title}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Comments placeholder */}
        <div className="mt-10 rounded-xl bg-white/5 border border-white/10 p-4">
          <div className="text-gray-300">Comments coming soon...</div>
        </div>
      </div>
    </div>
  );
}
