import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PublicBlog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [featuredPost, setFeaturedPost] = useState(null);

  useEffect(() => {
    base44.entities.BlogPost.filter({ status: 'published' }, '-published_date')
      .then((data) => {
        setPosts(data);
        if (data.length > 0) setFeaturedPost(data[0]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-slate-900 to-violet-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-jakarta font-bold mb-2">Blog & Guides</h1>
          <p className="text-slate-300">Insights and guides about investing in Turkish real estate</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No blog posts published yet.</p>
          </div>
        ) : (
          <>
            {/* Featured Post */}
            {featuredPost && (
              <Link to={`/blog/${featuredPost.slug || featuredPost.id}`} className="group block mb-10 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="h-64 md:h-auto bg-slate-100 overflow-hidden">
                    {featuredPost.main_image ? (
                      <img src={featuredPost.main_image} alt={featuredPost.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><Newspaper className="w-16 h-16" /></div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                      {featuredPost.category && <span className="bg-violet-50 text-violet-700 font-bold px-2.5 py-1 rounded-full">{featuredPost.category}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(featuredPost.published_date)}</span>
                      {featuredPost.reading_time_min && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {featuredPost.reading_time_min} min</span>}
                    </div>
                    <h2 className="text-2xl font-jakarta font-bold text-slate-800 mb-3 group-hover:text-violet-600 transition-colors">{featuredPost.title}</h2>
                    <p className="text-slate-500 leading-relaxed mb-4 line-clamp-3">{featuredPost.excerpt || ''}</p>
                    <span className="inline-flex items-center gap-1.5 text-violet-600 font-semibold text-sm group-hover:gap-2.5 transition-all">Read More <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.slice(1).map((post) => (
                <Link key={post.id} to={`/blog/${post.slug || post.id}`} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="h-48 overflow-hidden bg-slate-100">
                    {post.main_image ? (
                      <img src={post.main_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-300"><Newspaper className="w-12 h-12" /></div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      {post.category && <span className="bg-violet-50 text-violet-700 font-bold px-2 py-0.5 rounded-full">{post.category}</span>}
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(post.published_date)}</span>
                    </div>
                    <h3 className="font-jakarta font-bold text-slate-800 mb-2 group-hover:text-violet-600 transition-colors line-clamp-2">{post.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2">{post.excerpt || ''}</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
