import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Bed, Maximize2, Bath, Building2, Calendar, Layers, CheckCircle2, ArrowLeft, Phone, Mail, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PublicPropertyDetail() {
  const { slug } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadForm, setLeadForm] = useState({ full_name: '', email: '', phone: '', message: '' });

  useEffect(() => {
    base44.entities.Property.filter({ slug, status: 'active' })
      .then((data) => {
        if (data && data.length > 0) {
          setProperty(data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const formatPrice = (price, currency) => {
    if (!price) return 'Price on Request';
    const symbols = { USD: '$', EUR: '€', GBP: '£', TRY: '₺' };
    return `${symbols[currency] || ''}${Number(price).toLocaleString()}`;
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.Lead.create({
        ...leadForm,
        source: 'property-inquiry',
        status: 'new',
        interest: 'buy',
        property_ref: property?.property_ref || '',
      });
      setLeadSubmitted(true);
      setLeadForm({ full_name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Lead submission error:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <h2 className="text-xl font-bold text-slate-700 mb-2">Property Not Found</h2>
        <Link to="/listings" className="text-violet-600 font-semibold hover:underline">Back to listings</Link>
      </div>
    );
  }

  const images = property.images || (property.main_image ? [property.main_image] : []);
  const allImages = property.main_image && images[0] !== property.main_image ? [property.main_image, ...images] : images;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-violet-600">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/listings" className="hover:text-violet-600">Properties</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium truncate">{property.title || property.project_name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Gallery */}
        {allImages.length > 0 && (
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-3">
            <div className="lg:col-span-3 relative h-[400px] rounded-2xl overflow-hidden bg-slate-100 group cursor-pointer" onClick={() => setLightboxIndex(0)}>
              <img src={allImages[0]} alt={property.title} className="w-full h-full object-cover" />
              {allImages.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                  {allImages.length} photos
                </div>
              )}
            </div>
            <div className="hidden lg:grid grid-rows-2 gap-3">
              {allImages.slice(1, 3).map((img, i) => (
                <div key={i} className="relative h-[192px] rounded-xl overflow-hidden bg-slate-100 cursor-pointer group" onClick={() => setLightboxIndex(i + 1)}>
                  <img src={img} alt={`Gallery ${i + 2}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Location */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-jakarta font-bold text-slate-800 mb-2">
                    {property.title || property.project_name || 'Untitled Property'}
                  </h1>
                  <p className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {[property.country, property.city, property.district, property.neighborhood].filter(Boolean).join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-violet-600">{formatPrice(property.price, property.currency)}</div>
                  {property.old_price && <div className="text-sm text-slate-400 line-through">{formatPrice(property.old_price, property.currency)}</div>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {property.market_status && <span className="bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1 rounded-full">{property.market_status}</span>}
                {property.citizenship_eligible && <span className="bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">Citizenship Eligible</span>}
                {property.residency_eligible && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Residency Eligible</span>}
                {property.sea_view && <span className="bg-cyan-50 text-cyan-700 text-xs font-bold px-3 py-1 rounded-full">Sea View</span>}
                {property.seafront && <span className="bg-sky-50 text-sky-700 text-xs font-bold px-3 py-1 rounded-full">Seafront</span>}
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white rounded-2xl border border-slate-200 p-5">
              {property.bedrooms && <div className="flex flex-col items-center text-center"><Bed className="w-5 h-5 text-violet-500 mb-1.5" /><span className="text-xs text-slate-500">Bedrooms</span><span className="font-bold text-slate-800">{property.bedrooms}</span></div>}
              {property.bathrooms && <div className="flex flex-col items-center text-center"><Bath className="w-5 h-5 text-violet-500 mb-1.5" /><span className="text-xs text-slate-500">Bathrooms</span><span className="font-bold text-slate-800">{property.bathrooms}</span></div>}
              {property.size_sqm && <div className="flex flex-col items-center text-center"><Maximize2 className="w-5 h-5 text-violet-500 mb-1.5" /><span className="text-xs text-slate-500">Net Area</span><span className="font-bold text-slate-800">{property.size_sqm} m²</span></div>}
              {property.construction_year && <div className="flex flex-col items-center text-center"><Calendar className="w-5 h-5 text-violet-500 mb-1.5" /><span className="text-xs text-slate-500">Built</span><span className="font-bold text-slate-800">{property.construction_year}</span></div>}
              {property.floor_count && <div className="flex flex-col items-center text-center"><Layers className="w-5 h-5 text-violet-500 mb-1.5" /><span className="text-xs text-slate-500">Floors</span><span className="font-bold text-slate-800">{property.floor_count}</span></div>}
              {property.block_count && <div className="flex flex-col items-center text-center"><Building2 className="w-5 h-5 text-violet-500 mb-1.5" /><span className="text-xs text-slate-500">Blocks</span><span className="font-bold text-slate-800">{property.block_count}</span></div>}
              {property.total_sqm && <div className="flex flex-col items-center text-center"><Maximize2 className="w-5 h-5 text-violet-500 mb-1.5" /><span className="text-xs text-slate-500">Total Area</span><span className="font-bold text-slate-800">{property.total_sqm} m²</span></div>}
              {property.property_ref && <div className="flex flex-col items-center text-center"><CheckCircle2 className="w-5 h-5 text-violet-500 mb-1.5" /><span className="text-xs text-slate-500">Ref No</span><span className="font-bold text-slate-800 text-xs">{property.property_ref}</span></div>}
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-jakarta font-bold text-slate-800 mb-3 text-lg">Description</h2>
                <div className="prose prose-sm max-w-none text-slate-600 [&_p]:leading-relaxed [&_h2]:font-bold [&_h2]:text-slate-700 [&_h3]:font-bold [&_h3]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: property.description }} />
              </div>
            )}

            {/* Features */}
            {property.features && property.features.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-jakarta font-bold text-slate-800 mb-4 text-lg">Amenities & Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {property.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" />
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Distances */}
            {property.distances && property.distances.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-jakarta font-bold text-slate-800 mb-4 text-lg">Location & Distances</h2>
                <div className="space-y-2">
                  {property.distances.filter((d) => d.meters && d.visible !== false).map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-sm border-b border-slate-50 pb-2 last:border-0">
                      <span className="text-slate-600 font-medium">{d.label}</span>
                      <span className="font-bold text-slate-800">
                        {Number(d.meters) >= 1000 ? `${(Number(d.meters) / 1000).toFixed(2)} km` : `${d.meters} m`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SEO Content */}
            {property.seo_content && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="prose prose-sm max-w-none text-slate-600 [&_p]:leading-relaxed [&_h2]:font-bold [&_h2]:text-slate-700 [&_h3]:font-bold [&_h3]:text-slate-700 [&_ul]:list-disc [&_ul]:pl-5" dangerouslySetInnerHTML={{ __html: property.seo_content }} />
              </div>
            )}

            {/* FAQ */}
            {property.faq && property.faq.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <h2 className="font-jakarta font-bold text-slate-800 mb-4 text-lg">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {property.faq.map((item, i) => (
                    <div key={i} className="border-b border-slate-100 pb-3 last:border-0">
                      <h3 className="font-bold text-slate-700 text-sm mb-1">{item.q}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Contact Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-jakarta font-bold text-slate-800 mb-4">Interested in this property?</h3>
              <p className="text-sm text-slate-500 mb-4">Contact us for more information or to schedule a viewing.</p>

              {leadSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-bold text-emerald-700 text-sm">Thank you! We'll contact you soon.</p>
                </div>
              ) : showLeadForm ? (
                <form onSubmit={handleLeadSubmit} className="space-y-3">
                  <input required type="text" placeholder="Your Name" value={leadForm.full_name} onChange={(e) => setLeadForm({ ...leadForm, full_name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                  <input required type="email" placeholder="Email" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                  <input type="tel" placeholder="Phone" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                  <textarea placeholder="Message" value={leadForm.message} onChange={(e) => setLeadForm({ ...leadForm, message: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500 resize-none" />
                  <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-2.5 rounded-xl hover:opacity-90 transition-all">Send Inquiry</button>
                  <button type="button" onClick={() => setShowLeadForm(false)} className="w-full text-xs text-slate-400 hover:text-slate-600">Cancel</button>
                </form>
              ) : (
                <button onClick={() => setShowLeadForm(true)} className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition-all shadow-md">
                  Request Information
                </button>
              )}

              <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-violet-500" /> +90 242 000 00 00
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4 text-violet-500" /> info@propertiesforsaleturkey.com
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Link to="/listings" className="inline-flex items-center gap-1.5 text-violet-600 font-semibold text-sm hover:gap-2.5 transition-all">
            <ArrowLeft className="w-4 h-4" /> Back to listings
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && allImages[lightboxIndex] && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl" onClick={() => setLightboxIndex(null)}>&times;</button>
          {lightboxIndex > 0 && <button className="absolute left-4 text-white/80 hover:text-white" onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}><ChevronLeft className="w-8 h-8" /></button>}
          <img src={allImages[lightboxIndex]} alt="Gallery" className="max-w-full max-h-full rounded-xl" onClick={(e) => e.stopPropagation()} />
          {lightboxIndex < allImages.length - 1 && <button className="absolute right-4 text-white/80 hover:text-white" onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}><ChevronRight className="w-8 h-8" /></button>}
        </div>
      )}
    </div>
  );
}
