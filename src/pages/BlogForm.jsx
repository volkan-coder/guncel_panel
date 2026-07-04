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
import { ArrowLeft, Save, Loader2, FileText, Image as ImageIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import SeoContentStudio from '@/components/seo/SeoContentStudio';

const defaultForm = {
  title: '', slug: '', type: 'blog', status: 'draft', category: 'market-news',
  author: '', excerpt: '', content: '', main_image: '', featured: false,
  published_date: '', reading_time_min: '',
  seo_title: '', seo_description: '', seo_keywords: '',
  meta_title: '', meta_description: '', seo_content: '', ai_summary: '',
  faq: [], hizli_bilgiler: {}, json_ld_schema: null,
};

const CATEGORIES = ['market-news', 'investment', 'citizenship', 'residency', 'lifestyle', 'legal', 'city-guides', 'other'];

export default function BlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';
  const [form, setForm] = useState(defaultForm);
  const [activeTab, setActiveTab] = useState('general');

  const { data: post, isLoading } = useQuery({
    queryKey: ['post', id],
    queryFn: () => base44.entities.BlogPost.filter({ id }),
    enabled: !isNew,
  });

  useEffect(() => {
    if (post?.[0]) {
      setForm({
        ...defaultForm,
        ...post[0],
        faq: Array.isArray(post[0].faq) ? post[0].faq : [],
        hizli_bilgiler: post[0].hizli_bilgiler || {},
      });
    }
  }, [post]);

  const mutation = useMutation({
    mutationFn: (data) => isNew
      ? base44.entities.BlogPost.create(data)
      : base44.entities.BlogPost.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(isNew ? 'İçerik oluşturuldu!' : 'İçerik güncellendi!');
      navigate('/blog');
    },
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const onUpdate = (updates) => setForm(f => ({ ...f, ...updates }));

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const data = { ...form };
    if (data.reading_time_min) data.reading_time_min = Number(data.reading_time_min);
    if (Array.isArray(data.faq)) {
      data.faq = data.faq.filter(item => (item.q && item.q.trim()) || (item.a && item.a.trim()));
    }
    if (!data.title) data.title = data.seo_title || 'Yeni İçerik';
    mutation.mutate(data);
  };

  const tabs = [
    { id: 'general', label: 'Genel Bilgiler', icon: '📝' },
    { id: 'content', label: 'İçerik Editörü', icon: '✍️' },
    { id: 'photos', label: 'Görseller', icon: '📸' },
    { id: 'seo', label: 'SEO Stüdyo', icon: '🔍' },
  ];

  const isGuide = form.type === 'guide';
  const slugPrefix = isGuide ? '/turkey-guide' : '/blog';
  const entityType = isGuide ? 'guide' : form.type;

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
          <Link to="/blog">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-700">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-bold font-jakarta text-foreground">{isNew ? 'Yeni İçerik' : 'İçeriği Düzenle'}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{form.title || 'İçerik başlığı belirtilmedi'}</p>
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
        {/* TAB 1: GENEL BİLGİLER */}
        {activeTab === 'general' && (
          <div className="max-w-5xl mx-auto animate-in fade-in-50 duration-200">
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
                <FileText className="w-4 h-4 text-primary" /> Temel Bilgiler
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-[11px] font-bold text-emerald-600">BAŞLIK *</Label>
                  <Input value={form.title} onChange={e => set('title', e.target.value)} className="mt-1.5 border-emerald-200 focus-visible:ring-emerald-500" required />
                </div>
                <div>
                  <Label className="text-xs">Tip</Label>
                  <Select value={form.type} onValueChange={v => set('type', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="news">Haber</SelectItem>
                      <SelectItem value="guide">Turkey Guide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Durum</Label>
                  <Select value={form.status} onValueChange={v => set('status', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="published">Yayında</SelectItem>
                      <SelectItem value="archived">Arşiv</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Kategori</Label>
                  <Select value={form.category} onValueChange={v => set('category', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Yazar</Label>
                  <Input value={form.author} onChange={e => set('author', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Yayın Tarihi</Label>
                  <Input type="date" value={form.published_date} onChange={e => set('published_date', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Okuma Süresi (dk)</Label>
                  <Input type="number" value={form.reading_time_min} onChange={e => set('reading_time_min', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs">Ana Görsel URL</Label>
                  <Input value={form.main_image} onChange={e => set('main_image', e.target.value)} className="mt-1.5" placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">Özet (excerpt)</Label>
                  <Textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} className="mt-1.5" rows={3} />
                </div>
              </div>
              <div className="flex items-center gap-2.5 mt-2">
                <Switch checked={!!form.featured} onCheckedChange={v => set('featured', v)} />
                <Label>Öne Çıkan İçerik</Label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: İÇERİK EDITÖRÜ */}
        {activeTab === 'content' && (
          <div className="max-w-5xl mx-auto bg-card rounded-xl border border-border p-6 shadow-xs space-y-3 animate-in fade-in-50 duration-200">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
              <FileText className="w-4 h-4 text-primary" /> İçerik Editörü
            </h3>
            <div className="min-h-[400px] border border-slate-200 rounded-lg overflow-hidden bg-white">
              <ReactQuill
                value={form.content}
                onChange={val => set('content', val)}
                className="h-72"
                theme="snow"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    ['link', 'image'],
                    ['clean'],
                  ],
                }}
              />
            </div>
          </div>
        )}

        {/* TAB 3: GÖRSELLER */}
        {activeTab === 'photos' && (
          <div className="max-w-5xl mx-auto bg-card rounded-xl border border-border p-6 shadow-xs space-y-4 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Görsel Yönetimi
              </h3>
              <span className="bg-teal-50 text-teal-700 border border-teal-100 px-3 py-1 rounded-full text-xs font-bold">
                Ana Görsel
              </span>
            </div>
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-2">
              <Label className="text-xs font-bold text-slate-600">ANA GÖRSEL URL</Label>
              <div className="flex gap-2">
                <Input
                  value={form.main_image || ''}
                  onChange={e => set('main_image', e.target.value)}
                  placeholder="https://example.com/resim.jpg"
                  className="bg-white text-xs h-9"
                />
              </div>
              {form.main_image && (
                <div className="relative rounded-xl overflow-hidden border border-slate-200 max-w-xs">
                  <img src={form.main_image} alt="Ana görsel" className="w-full h-40 object-cover" />
                </div>
              )}
            </div>
            <label className="block border-2 border-dashed border-slate-200 hover:border-teal-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-white transition-all cursor-pointer group">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-white shadow-xs flex items-center justify-center text-slate-400 group-hover:text-teal-600 group-hover:scale-110 transition-all">
                  <span className="text-2xl">+</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Ana görsel yükle</p>
                  <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP</p>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  toast.loading('Görsel yükleniyor...', { id: 'blog-upload' });
                  try {
                    const { file_url } = await base44.integrations.Core.UploadFile({ file });
                    set('main_image', file_url);
                    toast.success('Ana görsel yüklendi!', { id: 'blog-upload' });
                  } catch {
                    toast.error('Görsel yükleme hatası.', { id: 'blog-upload' });
                  }
                }}
              />
            </label>
          </div>
        )}

        {/* TAB 4: SEO STÜDYO */}
        {activeTab === 'seo' && (
          <div className="max-w-5xl mx-auto animate-in fade-in-50 duration-200">
            <SeoContentStudio
              form={form}
              onUpdate={onUpdate}
              slugPrefix={slugPrefix}
              entityType={entityType}
              context={{
                title: form.title,
                city: null,
                category: form.category,
                description: form.excerpt || form.content,
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
