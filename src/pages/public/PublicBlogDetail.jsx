import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, Loader2, Newspaper } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PublicBlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.BlogPost.filter({ slug, status: 'published' })
      .then((data) => {
        if (data && data.length > 0) setPost(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <Newspaper className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Article Not Found</h2>
        <Link to="/blog" className="text-violet-600 font-semibold hover:underline">Back to blog</Link>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <div>
      {post.main_image && (
        <div className="h-[400px] w-full overflow-hidden bg-slate-100">
          <img src={post.main_image} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/blog" className="inline-flex items-center gap-1.5 text-violet-600 font-semibold text-sm hover:gap-2.5 transition-all mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>

        <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
          {post.category && <span className="bg-violet-50 text-violet-700 font-bold px-2.5 py-1 rounded-full">{post.category}</span>}
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(post.published_date)}</span>
          {post.reading_time_min && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {post.reading_time_min} min read</span>}
          {post.author && <span>by {post.author}</span>}
        </div>

        <h1 className="text-3xl md:text-4xl font-jakarta font-bold text-slate-800 mb-6">{post.title}</h1>

        {post.excerpt && <p className="text-lg text-slate-500 leading-relaxed mb-8 italic border-l-4 border-violet-200 pl-4">{post.excerpt}</p>}

        {post.content && (
          <div className="prose prose-lg max-w-none text-slate-700 [&_p]:leading-relaxed [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mt-8 [&_h3]:font-bold [&_h3]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_img]:rounded-xl" dangerouslySetInnerHTML={{ __html: post.content }} />
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, i) => <span key={i} className="bg-slate-100 text-slate-600 text-xs font-medium px-3 py-1.5 rounded-full">#{tag}</span>)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
