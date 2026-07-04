import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  ArrowLeft, Save, Loader2, LayoutGrid, Building2, Search, Image as ImageIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SeoContentStudio from '@/components/seo/SeoContentStudio';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'TRY'];
const CITIES = ['istanbul', 'antalya', 'fethiye', 'bodrum', 'ankara', 'izmir', 'alanya', 'other'];

const defaultForm = {
  title: '', slug: '', status: 'draft', city: 'istanbul', district: '', developer: '',
  completion_date: '', min_price: '', max_price: '', currency: 'USD',
  total_units: '', available_units: '', description: '', main_image: '',
  images: [], features: [],
  citizenship_eligible: false, featured: false,
  seo_title: '', seo_description: '', seo_keywords: '',
  meta_title: '', meta_description: '', seo_content: '', ai_summary: '',
  faq: [], hizli_bilgiler: {}, json_ld_schema: null,
};

export default function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';
  const [form, setForm] = useState(defaultForm);
  const [activeTab, setActiveTab] = useState('specs');

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => base44.entities.Project.filter({ id }),
    enabled: !isNew,
  });

  useEffect(() => {
    if (project?.[0]) {
      setForm({
        ...defaultForm,
        ...project[0],
        faq: Array.isArray(project[0].faq) ? project[0].faq : [],
        hizli_bilgiler: project[0].hizli_bilgiler || {},
        images: project[0].images || [],
        features: project[0].features || [],
      });
    }
  }, [project]);

  const mutation = useMutation({
    mutationFn: (data) => isNew
      ? base44.entities.Project.create(data)
      : base44.entities.Project.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success(isNew ? 'Proje oluşturuldu!' : 'Proje güncellendi!');
      navigate('/projects');
    },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const onUpdate = (updates) => setForm(f => ({ ...f, ...updates }));

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const data = { ...form };
    ['min_price', 'max_price', 'total_units', 'available_units'].forEach(k => {
      if (data[k] !== '' && data[k] !== null) data[k] = Number(data[k]);
    });
    if (Array.isArray(data.faq)) {
      data.faq = data.faq.filter(item => (item.q && item.q.trim()) || (item.a && item.a.trim()));
    }
    if (!data.title) data.title = data.seo_title || 'Yeni Proje';
    mutation.mutate(data);
  };

  const tabs = [
    { id: 'specs', label: 'Proje Detayları', icon: '🏗️' },
    { id: 'photos', label: 'Fotoğraflar', icon: '📸' },
    { id: 'seo', label: 'SEO Stüdyo', icon: '🔍' },
  ];

  if (isLoading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 select-none">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-border rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Link to="/projects">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold font-jakarta text-foreground">{isNew ? 'Yeni Proje' : 'Projeyi Düzenle'}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{form.title || 'Proje adı belirtilmedi'}</p>
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="sm:ml-auto gap-2 gradient-primary text-white border-0 hover:opacity-90 px-6 h-10 rounded-xl shadow-sm">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Kaydet
        </Button>
      </div>

      {/* Tab Navigasyon */}
      <div className="w-full bg-slate-50 border border-slate-200/60 rounded-2xl p-2.5">
        <div className="flex flex-wrap items-center gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form İçerikleri */}
      <div className="space-y-6">
        {/* TAB 1: PROJE DETAYLARI */}
        {activeTab === 'specs' && (
          <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in-50 duration-200">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <LayoutGrid className="w-4 h-4 text-primary" /> Proje Bilgileri
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label className="text-[11px] font-bold text-emerald-600">PROJE ADI *</Label>
                  <Input value={form.title} onChange={e => set('title', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" required />
                </div>
                <div>
                  <Label className="text-xs">Durum</Label>
                  <Select value={form.status} onValueChange={v => set('status', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="upcoming">Yakında</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Şehir</Label>
                  <Select value={form.city} onValueChange={v => set('city', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CITIES.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">İlçe</Label>
                  <Input value={form.district} onChange={e => set('district', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Geliştirici</Label>
                  <Input value={form.developer} onChange={e => set('developer', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Bitiş Tarihi</Label>
                  <Input type="date" value={form.completion_date} onChange={e => set('completion_date', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Para Birimi</Label>
                  <Select value={form.currency} onValueChange={v => set('currency', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Min. Fiyat</Label>
                  <Input type="number" value={form.min_price} onChange={e => set('min_price', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Max. Fiyat</Label>
                  <Input type="number" value={form.max_price} onChange={e => set('max_price', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Toplam Ünite</Label>
                  <Input type="number" value={form.total_units} onChange={e => set('total_units', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Mevcut Ünite</Label>
                  <Input type="number" value={form.available_units} onChange={e => set('available_units', e.target.value)} className="mt-1.5" />
                </div>
              </div>
              <div className="flex flex-wrap gap-6 mt-2">
                {[{ key: 'featured', label: 'Öne Çıkan' }, { key: 'citizenship_eligible', label: 'Vatandaşlık Uygun' }].map(({ key, label }) => (
                  <div key={key} className="flex items-center gap-2.5">
                    <Switch checked={!!form[key]} onCheckedChange={v => set(key, v)} />
                    <Label>{label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 space-y-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <Building2 className="w-4 h-4 text-primary" /> Açıklama
              </h3>
              <div className="min-h-[300px] border border-slate-200 rounded-lg overflow-hidden bg-white">
                <ReactQuill
                  value={form.description || ''}
                  onChange={val => set('description', val)}
                  className="h-60"
                  theme="snow"
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      ['link', 'clean'],
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FOTOĞRAFLAR */}
        {activeTab === 'photos' && (
          <div className="space-y-6 max-w-5xl mx-auto bg-card rounded-xl border border-border p-6 shadow-xs animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <div>
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" /> Galeri & Fotoğraf Yönetimi
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Projeye ait görselleri yönetin.</p>
              </div>
              <span className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full text-xs font-bold">
                {(form.images || []).length} Görsel
              </span>
            </div>

            <label className="block border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-white transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-400 group-hover:text-teal-600 group-hover:scale-110 transition-all">
                  <span className="text-2xl">+</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Fotoğrafları sürükleyin veya seçin</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP</p>
                </div>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  if (!files.length) return;
                  toast.loading(`${files.length} görsel yükleniyor...`, { id: 'proj-upload' });
                  try {
                    const uploadedUrls = [];
                    for (const file of files) {
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      uploadedUrls.push(file_url);
                    }
                    setForm(prev => ({
                      ...prev,
                      images: [...(prev.images || []), ...uploadedUrls],
                      main_image: prev.main_image || uploadedUrls[0] || '',
                    }));
                    toast.success('Görseller eklendi!', { id: 'proj-upload' });
                  } catch {
                    toast.error('Görsel yükleme hatası.', { id: 'proj-upload' });
                  }
                }}
              />
            </label>

            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
              <Label className="text-xs font-bold text-slate-600">VEYA URL İLE GÖRSEL EKLE</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="proj-img-url"
                  placeholder="https://example.com/resim.jpg"
                  className="bg-white text-xs h-9"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val) {
                        setForm(prev => ({ ...prev, images: [...(prev.images || []), val], main_image: prev.main_image || val }));
                        e.target.value = '';
                        toast.success('Görsel eklendi!');
                      }
                    }
                  }}
                />
                <Button type="button" size="sm" onClick={() => {
                  const input = document.getElementById('proj-img-url');
                  const val = input?.value?.trim();
                  if (val) {
                    setForm(prev => ({ ...prev, images: [...(prev.images || []), val], main_image: prev.main_image || val }));
                    input.value = '';
                    toast.success('Görsel eklendi!');
                  }
                }} className="bg-slate-800 text-white font-semibold text-xs h-9 px-4 rounded-lg">Ekle</Button>
              </div>
            </div>

            {(!form.images || form.images.length === 0) ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-muted-foreground bg-slate-50/30">
                Henüz görsel eklenmedi.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {form.images.map((url, idx) => {
                  const isMain = form.main_image === url;
                  return (
                    <div key={idx} className={`relative group rounded-xl overflow-hidden border bg-slate-50 transition-all ${isMain ? 'ring-2 ring-teal-500 border-transparent shadow-sm' : 'border-slate-200'}`}>
                      <img src={url} alt={`Galeri ${idx + 1}`} className="w-full h-28 object-cover" />
                      {isMain && (
                        <span className="absolute top-1.5 left-1.5 bg-teal-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">VİTRİN</span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
                        {!isMain && (
                          <button type="button" onClick={() => { set('main_image', url); toast.success('Vitrin güncellendi!'); }} className="text-[10px] font-bold text-white bg-teal-600/90 hover:bg-teal-600 px-2 py-1 rounded-md w-full text-center">Vitrin Yap</button>
                        )}
                        <button type="button" onClick={() => {
                          setForm(prev => {
                            const filtered = prev.images.filter(u => u !== url);
                            return { ...prev, images: filtered, main_image: isMain ? (filtered[0] || '') : prev.main_image };
                          });
                          toast.success('Görsel kaldırıldı.');
                        }} className="text-[10px] font-bold text-white bg-rose-600/90 hover:bg-rose-600 px-2 py-1 rounded-md w-full text-center">Kaldır</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SEO STÜDYO */}
        {activeTab === 'seo' && (
          <div className="max-w-5xl mx-auto animate-in fade-in-50 duration-200">
            <SeoContentStudio
              form={form}
              onUpdate={onUpdate}
              slugPrefix="/projects"
              entityType="project"
              context={{
                title: form.title,
                city: form.city,
                category: form.status,
                description: form.description,
              }}
            />
          </div>
        )}
      </div>

      {/* Alt Kaydetme */}
      <div className="flex justify-end pt-2">
        <Button onClick={handleSubmit} disabled={mutation.isPending} className="gap-2 gradient-primary text-white border-0 hover:opacity-90 px-8 h-11 rounded-xl shadow-md font-bold text-sm">
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Kaydet
        </Button>
      </div>
    </div>
  );
}
