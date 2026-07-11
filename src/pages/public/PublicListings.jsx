import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Bed, Maximize2, Bath, Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PublicListings() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    Promise.all([
      base44.entities.Property.filter({ status: 'active' }, '-created_at').catch(() => []),
      base44.entities.PropertyType.filter({ is_active: true }, 'order').catch(() => []),
      base44.entities.Location.filter({}).catch(() => []),
    ]).then(([props, types, locs]) => {
      setProperties(props);
      setPropertyTypes(types);
      const uniqueCities = [...new Set(locs.map((l) => l.city_label || l.city).filter(Boolean))].sort();
      setCities(uniqueCities);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${p.title || ''} ${p.project_name || ''} ${p.district || ''} ${p.city || ''}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filterCity && p.city !== filterCity) return false;
      if (filterType && p.type !== filterType) return false;
      if (filterStatus && p.market_status !== filterStatus) return false;
      return true;
    });
  }, [properties, search, filterCity, filterType, filterStatus]);

  const formatPrice = (price, currency) => {
    if (!price) return 'Price on Request';
    const symbols = { USD: '$', EUR: '€', GBP: '£', TRY: '₺' };
    return `${symbols[currency] || ''}${Number(price).toLocaleString()}`;
  };

  const clearFilters = () => {
    setSearch(''); setFilterCity(''); setFilterType(''); setFilterStatus('');
  };

  const hasActiveFilters = search || filterCity || filterType || filterStatus;

  return (
    <div>
      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 to-violet-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-jakarta font-bold mb-2">Properties for Sale in Turkey</h1>
          <p className="text-slate-300">Browse our complete portfolio of premium real estate</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, city, district..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-violet-500"
              >
                <option value="">All Cities</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-violet-500"
              >
                <option value="">All Types</option>
                {propertyTypes.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:border-violet-500"
              >
                <option value="">All Statuses</option>
                <option value="For Sale">For Sale</option>
                <option value="Rent">Rent</option>
                <option value="Daily Rent">Daily Rent</option>
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">{filtered.length} results</span>
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 font-semibold">
                <X className="w-3 h-3" /> Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((prop) => (
              <Link
                key={prop.id}
                to={`/property/${prop.slug || prop.id}`}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  {prop.main_image ? (
                    <img src={prop.main_image} alt={prop.title || prop.project_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Building2 className="w-12 h-12" />
                    </div>
                  )}
                  {prop.featured && (
                    <span className="absolute top-3 left-3 bg-violet-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">Featured</span>
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
          <div className="text-center py-20 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">No properties found matching your criteria.</p>
            {hasActiveFilters && <button onClick={clearFilters} className="mt-2 text-violet-600 font-semibold text-sm hover:underline">Clear all filters</button>}
          </div>
        )}
      </div>
    </div>
  );
}
