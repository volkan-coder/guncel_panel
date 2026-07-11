import { useState } from 'react';
import { Phone, Mail, MapPin, CheckCircle2, Loader2, Send } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function PublicContact() {
  const [form, setForm] = useState({
    full_name: '', email: '', phone: '', nationality: '',
    message: '', interest: 'buy', preferred_city: '',
    budget_min: '', budget_max: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await base44.entities.Lead.create({
        ...form,
        source: 'contact-form',
        status: 'new',
      });
      setSubmitted(true);
      setForm({ full_name: '', email: '', phone: '', nationality: '', message: '', interest: 'buy', preferred_city: '', budget_min: '', budget_max: '' });
    } catch (err) {
      console.error('Contact form error:', err);
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="bg-gradient-to-br from-slate-900 to-violet-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-jakarta font-bold mb-2">Contact Us</h1>
          <p className="text-slate-300">Get in touch with our property experts</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="font-jakarta font-bold text-slate-800 mb-4">Get in Touch</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Phone</div>
                    <div className="text-sm font-semibold text-slate-700">+90 242 000 00 00</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Email</div>
                    <div className="text-sm font-semibold text-slate-700">info@propertiesforsaleturkey.com</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-bold uppercase">Office</div>
                    <div className="text-sm font-semibold text-slate-700">Antalya, Turkey</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
              <h3 className="font-jakarta font-bold mb-2">Free Consultation</h3>
              <p className="text-violet-100 text-sm leading-relaxed mb-4">Our experienced team will help you find the perfect property investment in Turkey.</p>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" /> 100% Free, No Obligation
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-jakarta font-bold text-slate-800 mb-2">Thank You!</h3>
                  <p className="text-slate-500 mb-6">Your message has been received. Our team will contact you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="text-violet-600 font-semibold text-sm hover:underline">Send another message</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="font-jakarta font-bold text-slate-800 text-lg mb-2">Send us a message</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Full Name *</label>
                      <input required type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Email *</label>
                      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Phone</label>
                      <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nationality</label>
                      <input type="text" value={form.nationality} onChange={(e) => setForm({ ...form, nationality: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Interest</label>
                      <select value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500">
                        <option value="buy">Buy</option>
                        <option value="citizenship">Citizenship</option>
                        <option value="residency">Residency</option>
                        <option value="investment">Investment</option>
                        <option value="rent">Rent</option>
                        <option value="sell">Sell</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Min Budget</label>
                      <input type="number" value={form.budget_min} onChange={(e) => setForm({ ...form, budget_min: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Max Budget</label>
                      <input type="number" value={form.budget_max} onChange={(e) => setForm({ ...form, budget_max: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Preferred City</label>
                    <input type="text" value={form.preferred_city} onChange={(e) => setForm({ ...form, preferred_city: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500" />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Message *</label>
                    <textarea required value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none" placeholder="Tell us about your property requirements..." />
                  </div>

                  <button type="submit" disabled={submitting} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all shadow-md disabled:opacity-50">
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
