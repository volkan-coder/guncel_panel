import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, TrendingUp, ShieldCheck, MapPin, ArrowRight, Star, Bed, Maximize2, Bath, Eye } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PublicHome() {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Property.filter({ featured: true, status: 'active' }, undefined, 6).catch(() => []),
      base44.entities.Project.filter({ featured: true, status: 'active' }, undefined, 3).catch(() => []),
    ]).then(([props, projs]) => {
      setFeaturedProperties(props);
      setFeaturedProjects(projs);
      setLoading(false);
    });
  }, []);

  const formatPrice = (price, currency) => {
    if (!price) return 'Price on Request';
    const symbols = { USD: '$', EUR: '€', GBP: '£', TRY: '₺' };
    return `${symbols[currency] || ''}${Number(price).toLocaleString()}`;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-violet-900 to-purple-900" />
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'url(https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-violet-100 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-wider">
              <Star className="w-3.5 h-3.5" /> Premium Real Estate in Turkey
            </span>
            <h1 className="text-4xl md:text-6xl font-jakarta font-bold text-white leading-tight mb-6">
              Find Your Dream <br />
              <span className="bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text text-transparent">Property in Turkey</span>
            </h1>
            <p className="text-lg text-slate-200 mb-8 leading-relaxed max-w-xl">
              Discover premium apartments, villas, and investment properties across Turkey's most sought-after locations.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/listings"
                className="inline-flex items-center justify-center gap-2 bg-white text-slate-900 font-bold px-7 py-3.5 rounded-xl shadow-xl hover:scale-[1.02] transition-all"
              >
                Browse Properties <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/20 transition-all"
              >
                Get a Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Building2, label: 'Properties Listed', value: '500+' },
              { icon: MapPin, label: 'Cities Covered', value: '12' },
              { icon: ShieldCheck, label: 'Citizenship Approved', value: '200+' },
              { icon: TrendingUp, label: 'Happy Investors', value: '1000+' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 font-jakarta">{value}</div>
                  <div className="text-xs text-slate-500 font-medium">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-jakarta font-bold text-slate-800 mb-2">Featured Properties</h2>
            <p className="text-slate-500">Handpicked premium listings from our portfolio</p>
          </div>
          <Link to="/listings" className="hidden sm:flex items-center gap-1.5 text-violet-600 font-semibold text-sm hover:gap-2.5 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden animate-pulse">
                <div className="h-52 bg-slate-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : featuredProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((prop) => (
              <Link
                key={prop.id}
                to={`/property/${prop.slug || prop.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  {prop.main_image ? (
                    <img
                      src={prop.main_image}
                      alt={prop.title || prop.project_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Building2 className="w-12 h-12" />
                    </div>
                  )}
                  {prop.featured && (
                    <span className="absolute top-3 left-3 bg-violet-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Featured
                    </span>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700">
                    {formatPrice(prop.price, prop.currency)}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-jakarta font-bold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors">
                    {prop.title || prop.project_name || 'Untitled Property'}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {[prop.city, prop.district].filter(Boolean).join(', ') || 'Turkey'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    {prop.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" /> {prop.bedrooms}</span>}
                    {prop.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" /> {prop.bathrooms}</span>}
                    {prop.size_sqm && <span className="flex items-center gap-1"><Maximize2 className="w-3.5 h-3.5" /> {prop.size_sqm} m²</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No featured properties yet. Add some from the admin panel!</p>
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-white border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-jakarta font-bold text-slate-800 mb-2">Why Choose Us</h2>
            <p className="text-slate-500">We make property investment in Turkey seamless and secure</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: 'Secure Transactions', desc: 'All our properties come with legal title deed assistance and full transparency.' },
              { icon: TrendingUp, title: 'Investment Expertise', desc: 'Our team analyzes market trends to recommend the best investment opportunities.' },
              { icon: MapPin, title: 'Prime Locations', desc: 'Properties in Turkey\'s most desirable areas — from Antalya to Istanbul.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center p-6 rounded-2xl border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-violet-600" />
                </div>
                <h3 className="font-jakarta font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-purple-700 p-8 md:p-12 text-center">
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'url(https://images.pexels.com/photos/302769/pexels-photo-302769.jpeg?auto=compress&cs=tinysrgb&w=1200)',
            backgroundSize: 'cover',
          }} />
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-jakarta font-bold text-white mb-4">Ready to Invest in Turkey?</h2>
            <p className="text-violet-100 mb-8 max-w-2xl mx-auto">Get a free consultation with our property experts today.</p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-7 py-3.5 rounded-xl shadow-lg hover:scale-[1.02] transition-all"
            >
              Contact Us <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
