export default function PostCard({ post }){
  return (
    <article className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 shadow-xl hover:shadow-2xl transition">
      <div className="aspect-[16/9] bg-black/20">
        <img src={post.cover} alt={post.title} className="w-full h-full object-cover"/>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between text-xs text-gray-300">
          <span>{post.readingTime}</span>
          <span>{new Date(post.date).toLocaleDateString()}</span>
        </div>
        <h2 className="mt-2 text-lg font-bold">{post.title}</h2>
        <p className="text-sm text-gray-200/90 mt-1 line-clamp-3">{post.excerpt}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags?.map(tag => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-purple-600/20 text-purple-200 border border-purple-500/30">{tag}</span>
          ))}
        </div>
        <a href={`/blog/${post.id}`} className="inline-block mt-4 text-sm text-purple-300 hover:text-purple-200">Read more →</a>
      </div>
    </article>
  );
}
