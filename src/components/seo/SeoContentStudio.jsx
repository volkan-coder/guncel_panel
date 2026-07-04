import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sparkles, Loader2, Globe, ChevronDown, ChevronUp, Search,
  BrainCircuit, HelpCircle, Braces, CheckCircle, XCircle, Plus, Trash2, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const BASE_URL = 'https://propertiesforsaleturkey.com';

const SEO_FIELD_ALIASES = {
  slug: ['slug', 'url_slug', 'urlslug', 'url slug'],
  seo_title: ['seo_title', 'seotitle', 'seo title'],
  meta_title: ['meta_title', 'metatitle', 'meta title'],
  meta_description: ['meta_description', 'metadescription', 'meta description'],
  seo_description: ['seo_description', 'seodescription', 'seo description'],
  seo_content: ['seo_content', 'seocontent', 'seo content', 'content'],
  seo_keywords: ['seo_keywords', 'seokeywords', 'seo keywords', 'keywords'],
  ai_summary: ['ai_summary', 'aisummary', 'ai summary'],
  excerpt: ['excerpt', 'ozet', 'özet'],
};

const normalizeKey = (key) => key.toLowerCase().trim();

function normalizeSeoJson(raw) {
  const lookup = {};
  Object.keys(raw).forEach(k => { lookup[normalizeKey(k)] = raw[k]; });

  const result = {};
  Object.entries(SEO_FIELD_ALIASES).forEach(([targetField, aliases]) => {
    for (const alias of aliases) {
      const n = normalizeKey(alias);
      if (lookup[n] !== undefined && lookup[n] !== '') {
        result[targetField] = lookup[n];
        break;
      }
    }
  });
  return result;
}

function extractNonScalarSeoData(raw) {
  const lookup = {};
  Object.keys(raw).forEach(k => { lookup[normalizeKey(k)] = raw[k]; });

  const result = {};

  if (Array.isArray(lookup['faq'])) {
    result.faq = lookup['faq'].map(item => ({
      q: item?.q ?? item?.soru ?? item?.question ?? '',
      a: item?.a ?? item?.cevap ?? item?.answer ?? '',
    }));
  }

  const hizliKey = ['hizli_bilgiler', 'hizlibilgiler', 'quick_info', 'hızlı bilgiler']
    .find(k => lookup[k] && typeof lookup[k] === 'object');
  if (hizliKey) result.hizli_bilgiler = lookup[hizliKey];

  const jsonLdKey = ['json_ld_schema', 'jsonldschema', 'json-ld', 'jsonld']
    .find(k => lookup[k] && typeof lookup[k] === 'object');
  if (jsonLdKey) result.json_ld_schema = lookup[jsonLdKey];

  return result;
}

function SerpPreview({ title, description, slug, slugPrefix = '' }) {
  const displayTitle = title || 'Sayfa Başlığı';
  const displayDesc = description || 'Sayfa açıklaması burada görünecek...';
  const displayUrl = slug ? `${BASE_URL}${slugPrefix}/${slug}` : BASE_URL;
  const titleLen = title?.length || 0;
  const descLen = description?.length || 0;

  return (
    <div className="rounded-xl border border-border bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <Globe className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Google SERP Önizlemesi</span>
      </div>
      <div className="max-w-[600px] font-sans">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
            <Globe className="w-3 h-3 text-muted-foreground" />
          </div>
          <span className="text-xs text-[#202124]">{BASE_URL.replace('https://', '')}</span>
          <span className="text-xs text-[#202124]">›</span>
          <span className="text-xs text-[#202124] truncate">{slug || 'sayfa-url'}</span>
        </div>
        <h3 className={`text-[#1a0dab] text-xl leading-snug hover:underline cursor-pointer line-clamp-1 ${titleLen > 60 ? 'text-orange-600' : ''}`}>
          {displayTitle.length > 60 ? displayTitle.slice(0, 57) + '...' : displayTitle}
        </h3>
        <p className="text-[#4d5156] text-sm leading-relaxed mt-1 line-clamp-2">
          {displayDesc.length > 160 ? displayDesc.slice(0, 157) + '...' : displayDesc}
        </p>
      </div>
      <div className="flex gap-6 mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Başlık:</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
            titleLen === 0 ? 'bg-muted text-muted-foreground' :
            titleLen <= 60 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>{titleLen}/60</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Açıklama:</span>
          <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
            descLen === 0 ? 'bg-muted text-muted-foreground' :
            descLen <= 160 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}>{descLen}/160</span>
        </div>
      </div>
    </div>
  );
}

const HIZLI_BILGILER_FIELDS = [
  { key: 'summary', label: 'Özet', placeholder: 'Kısa özet...' },
  { key: 'category', label: 'Kategori', placeholder: 'Yatırım' },
  { key: 'reading_time', label: 'Okuma Süresi', placeholder: '5 dk' },
  { key: 'author', label: 'Yazar', placeholder: 'Editör' },
  { key: 'published_date', label: 'Yayın Tarihi', placeholder: '2024' },
  { key: 'tags', label: 'Etiketler', placeholder: 'Türkiye, Emlak' },
];

const EMPTY_HIZLI_BILGILER = HIZLI_BILGILER_FIELDS.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {});

/**
 * Reusable SEO/GEO/AEO content studio.
 * Works for projects, blog posts, news, and Turkey Guide articles.
 *
 * Props:
 *  - form: the entity form state
 *  - onUpdate: (partial) => void  — merges into form
 *  - slugPrefix: string e.g. '/blog' or '/projects'
 *  - entityType: 'project' | 'blog' | 'guide' | 'news' — used in AI prompt
 *  - context: object with title, city, category, etc. for AI prompt
 *  - gemUrl: optional Gemini share link for the SEO JSON template
 */
export default function SeoContentStudio({
  form,
  onUpdate,
  slugPrefix = '',
  entityType = 'blog',
  context = {},
  gemUrl = '',
}) {
  const [seoJsonInput, setSeoJsonInput] = useState('');
  const [showSeoJsonBox, setShowSeoJsonBox] = useState(false);
  const [jsonLdText, setJsonLdText] = useState(
    form.json_ld_schema ? JSON.stringify(form.json_ld_schema, null, 2) : ''
  );
  const [jsonLdError, setJsonLdError] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showSerp, setShowSerp] = useState(true);

  const seoJsonPreview = useMemo(() => {
    if (!seoJsonInput.trim()) return null;
    try {
      const clean = seoJsonInput.trim().replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);
      const normalized = normalizeSeoJson(parsed);
      const extra = extractNonScalarSeoData(parsed);
      return { data: { ...normalized, ...extra }, error: null };
    } catch {
      return { data: null, error: 'Geçersiz JSON formatı' };
    }
  }, [seoJsonInput]);

  const set = (key, val) => onUpdate({ [key]: val });

  const setHizliBilgi = (key, val) => {
    const current = form.hizli_bilgiler || { ...EMPTY_HIZLI_BILGILER };
    onUpdate({ hizli_bilgiler: { ...current, [key]: val } });
  };

  const handleAddFaq = () => {
    const current = Array.isArray(form.faq) ? form.faq : [];
    onUpdate({ faq: [...current, { q: '', a: '' }] });
  };
  const handleRemoveFaq = (index) => {
    const current = Array.isArray(form.faq) ? form.faq : [];
    onUpdate({ faq: current.filter((_, i) => i !== index) });
  };
  const setFaqValue = (index, key, val) => {
    const current = Array.isArray(form.faq) ? form.faq : [];
    const items = [...current];
    items[index] = { ...items[index], [key]: val };
    onUpdate({ faq: items });
  };

  const handleApplyJsonLd = () => {
    if (!jsonLdText.trim()) {
      set('json_ld_schema', null);
      setJsonLdError(null);
      toast.success('JSON-LD şeması temizlendi.');
      return;
    }
    try {
      const clean = jsonLdText.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(clean);
      set('json_ld_schema', parsed);
      setJsonLdError(null);
      toast.success('JSON-LD şeması doğrulandı ve uygulandı!');
    } catch (err) {
      setJsonLdError(err.message);
      toast.error('JSON-LD ayrıştırma hatası: ' + err.message);
    }
  };

  const handleApplySeoJson = () => {
    if (!seoJsonInput.trim()) return;
    try {
      const clean = seoJsonInput.trim().replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(clean);
      const normalized = normalizeSeoJson(parsed);
      const extra = extractNonScalarSeoData(parsed);

      if (Object.keys(normalized).length === 0 && Object.keys(extra).length === 0) {
        toast.error('JSON içinde tanınan bir SEO alanı bulunamadı.');
        return;
      }

      const updates = {};
      if (normalized.slug !== undefined) updates.slug = normalized.slug;
      if (normalized.seo_title !== undefined) updates.seo_title = normalized.seo_title;
      if (normalized.meta_title !== undefined) updates.meta_title = normalized.meta_title;
      if (normalized.meta_description !== undefined) updates.meta_description = normalized.meta_description;
      if (normalized.seo_description !== undefined) updates.seo_description = normalized.seo_description;
      if (normalized.seo_keywords !== undefined) updates.seo_keywords = normalized.seo_keywords;
      if (normalized.seo_content !== undefined) updates.seo_content = normalized.seo_content;
      else updates.seo_content = clean;
      if (normalized.ai_summary !== undefined) updates.ai_summary = normalized.ai_summary;
      if (normalized.excerpt !== undefined) updates.excerpt = normalized.excerpt;
      if (extra.faq !== undefined) updates.faq = extra.faq;
      if (extra.hizli_bilgiler !== undefined) updates.hizli_bilgiler = { ...EMPTY_HIZLI_BILGILER, ...extra.hizli_bilgiler };
      if (extra.json_ld_schema !== undefined) {
        updates.json_ld_schema = extra.json_ld_schema;
        setJsonLdText(JSON.stringify(extra.json_ld_schema, null, 2));
        setJsonLdError(null);
      }

      onUpdate(updates);
      toast.success('SEO verileri başarıyla alanlara aktarıldı!');
      setSeoJsonInput('');
      setShowSeoJsonBox(false);
    } catch (error) {
      toast.error('JSON parse hatası: ' + error.message);
    }
  };

  const handleAiGenerate = async () => {
    const title = context.title || form.title || '';
    if (!title) {
      toast.error('Başlık gerekli.');
      return;
    }
    setAiLoading(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an SEO/GEO/AEO expert for a Turkish real estate website (${BASE_URL}).
Generate complete SEO metadata for a ${entityType} page.

Title: ${title}
City/Location: ${context.city || 'Turkey'}
Category: ${context.category || entityType}
Description: ${context.description || form.excerpt || 'N/A'}

Return JSON with these fields:
1. seo_title: Max 60 chars. Include entity type, city, and "Turkey". Compelling, no clickbait.
2. meta_title: Max 60 chars. Slightly different from seo_title, optimized for <title> tag.
3. meta_description: Max 155 chars. Highlight key value, location, and CTA. Natural English.
4. seo_description: Same constraints as meta_description but can be a different angle.
5. slug: URL-friendly, lowercase, hyphens. Include city/type. Max 60 chars.
6. seo_keywords: Comma-separated, 5-8 keywords.
7. ai_summary: 2-3 sentence engaging summary.
8. excerpt: 1-2 sentence short excerpt for cards.
9. faq: Array of 3-5 {q, a} pairs — common questions users ask (AEO optimized).
10. hizli_bilgiler: Object with keys: summary, category, reading_time, author, published_date, tags.
11. json_ld_schema: Valid schema.org JSON-LD object (Article, BlogPosting, or RealEstateListing depending on type).

Return ONLY valid JSON, no explanations.`,
        response_json_schema: {
          type: 'object',
          properties: {
            seo_title: { type: 'string' },
            meta_title: { type: 'string' },
            meta_description: { type: 'string' },
            seo_description: { type: 'string' },
            slug: { type: 'string' },
            seo_keywords: { type: 'string' },
            ai_summary: { type: 'string' },
            excerpt: { type: 'string' },
            faq: { type: 'array', items: { type: 'object', properties: { q: { type: 'string' }, a: { type: 'string' } } } },
            hizli_bilgiler: { type: 'object' },
            json_ld_schema: { type: 'object' },
          },
        },
      });

      const updates = {};
      if (result.seo_title) updates.seo_title = result.seo_title;
      if (result.meta_title) updates.meta_title = result.meta_title;
      if (result.meta_description) updates.meta_description = result.meta_description;
      if (result.seo_description) updates.seo_description = result.seo_description;
      if (result.slug) updates.slug = result.slug;
      if (result.seo_keywords) updates.seo_keywords = result.seo_keywords;
      if (result.ai_summary) updates.ai_summary = result.ai_summary;
      if (result.excerpt) updates.excerpt = result.excerpt;
      if (Array.isArray(result.faq)) updates.faq = result.faq;
      if (result.hizli_bilgiler) updates.hizli_bilgiler = { ...EMPTY_HIZLI_BILGILER, ...result.hizli_bilgiler };
      if (result.json_ld_schema) {
        updates.json_ld_schema = result.json_ld_schema;
        setJsonLdText(JSON.stringify(result.json_ld_schema, null, 2));
        setJsonLdError(null);
      }
      onUpdate(updates);
      toast.success('AI SEO verileri başarıyla üretildi ve uygulandı!');
    } catch (err) {
      toast.error('AI üretimi başarısız: ' + (err.message || 'Bilinmeyen hata'));
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Generate + Gem Link */}
      <div className="bg-gradient-to-r from-teal-50/60 to-cyan-50/40 border border-teal-100 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-teal-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600 animate-pulse" /> SEO / GEO / AEO Stüdyo
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Tek tıkla AI ile SEO uyumlu başlık, meta, açıklama, FAQ ve JSON-LD üret; ya da Gem çıktısını yapıştır.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {gemUrl && (
              <Button asChild size="sm" variant="outline" className="border-teal-500 text-teal-700 bg-white hover:bg-teal-50 text-xs font-bold rounded-xl h-9 px-4">
                <a href={gemUrl} target="_blank" rel="noopener noreferrer">Gem Şablonunu Aç</a>
              </Button>
            )}
            <Button
              type="button"
              onClick={handleAiGenerate}
              disabled={aiLoading}
              className="gap-2 bg-teal-600 hover:bg-teal-700 text-white border-0 hover:opacity-90 text-xs font-bold rounded-xl h-9 px-5"
            >
              {aiLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Üretiliyor...</> : <><Sparkles className="w-4 h-4" /> AI ile Üret</>}
            </Button>
          </div>
        </div>

        {/* JSON paste box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] font-bold text-teal-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> JSON VERİSİ YAPIŞTIR (Gem çıktısı veya manuel JSON)
            </Label>
            <button type="button" onClick={() => setShowSeoJsonBox(v => !v)} className="text-[11px] font-medium text-teal-600 hover:underline">
              {showSeoJsonBox ? 'Gizle' : 'Göster'}
            </button>
          </div>
          {showSeoJsonBox && (
            <div className="bg-teal-50/40 border border-teal-100 rounded-xl p-4 space-y-2">
              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  placeholder='{"seo_title": "...", "meta_description": "...", "slug": "...", "ai_summary": "...", "faq": [...], "hizli_bilgiler": {...}, "json_ld_schema": {...}}'
                  value={seoJsonInput}
                  onChange={e => setSeoJsonInput(e.target.value)}
                  className="flex min-h-[120px] w-full rounded-xl border border-input bg-white px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 focus:border-teal-500 resize-y font-mono text-foreground"
                />
                <Button
                  type="button"
                  onClick={handleApplySeoJson}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-5 rounded-xl transition-all shadow-xs shrink-0 h-auto sm:w-32 flex items-center justify-center self-stretch"
                >
                  Verileri Aktar
                </Button>
              </div>
              {seoJsonPreview?.error && (
                <p className="text-[11px] font-semibold text-rose-600">⚠️ {seoJsonPreview.error}</p>
              )}
              {seoJsonPreview?.data && (
                <div className="bg-white border border-teal-100 rounded-xl p-4 space-y-2">
                  <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider border-b border-teal-50 pb-2">
                    Önizleme — Aktarmadan Önce Kontrol Edin
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {seoJsonPreview.data.slug && (
                      <div className="sm:col-span-2"><span className="font-bold text-slate-500">URL Slug:</span> <span className="font-mono text-slate-700">{slugPrefix}/{seoJsonPreview.data.slug}</span></div>
                    )}
                    {seoJsonPreview.data.seo_title && (
                      <div className="sm:col-span-2"><span className="font-bold text-slate-500">SEO Title:</span> <span className="text-slate-700">{seoJsonPreview.data.seo_title}</span></div>
                    )}
                    {seoJsonPreview.data.meta_description && (
                      <div className="sm:col-span-2"><span className="font-bold text-slate-500">Meta Description:</span> <span className="text-slate-700">{seoJsonPreview.data.meta_description}</span></div>
                    )}
                    {Array.isArray(seoJsonPreview.data.faq) && (
                      <div className="sm:col-span-2"><span className="font-bold text-slate-500">FAQ:</span> <span className="text-slate-700">{seoJsonPreview.data.faq.length} soru</span></div>
                    )}
                    {seoJsonPreview.data.json_ld_schema && (
                      <div className="sm:col-span-2"><span className="font-bold text-slate-500">JSON-LD:</span> <span className="text-slate-700">Bulundu</span></div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SERP Preview */}
      <div className="space-y-2">
        <button type="button" onClick={() => setShowSerp(v => !v)} className="flex items-center gap-2 text-xs font-medium text-primary hover:underline">
          {showSerp ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          SERP Önizlemesi {showSerp ? 'Gizle' : 'Göster'}
        </button>
        {showSerp && (
          <SerpPreview
            title={form.meta_title || form.seo_title}
            description={form.meta_description || form.seo_description}
            slug={form.slug}
            slugPrefix={slugPrefix}
          />
        )}
      </div>

      {/* Core SEO fields */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
          <Search className="w-4 h-4 text-primary" /> Temel SEO Alanları
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">URL Slug</Label>
            <Input value={form.slug || ''} onChange={e => set('slug', e.target.value)} className="mt-1.5 font-mono text-xs" placeholder="ornek-url-slug" />
          </div>
          <div>
            <Label className="text-xs">SEO Title</Label>
            <Input value={form.seo_title || ''} onChange={e => set('seo_title', e.target.value)} className="mt-1.5 text-xs" placeholder="SEO başlığı" />
            <p className="text-[10px] text-muted-foreground mt-1">{(form.seo_title || '').length}/60</p>
          </div>
          <div>
            <Label className="text-xs">Meta Title</Label>
            <Input value={form.meta_title || ''} onChange={e => set('meta_title', e.target.value)} className="mt-1.5 text-xs" placeholder="Meta başlık" />
            <p className="text-[10px] text-muted-foreground mt-1">{(form.meta_title || '').length}/60</p>
          </div>
          <div>
            <Label className="text-xs">Anahtar Kelimeler</Label>
            <Input value={form.seo_keywords || ''} onChange={e => set('seo_keywords', e.target.value)} className="mt-1.5 text-xs" placeholder="anahtar, kelimeler" />
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">Meta Description</Label>
            <Textarea value={form.meta_description || ''} onChange={e => set('meta_description', e.target.value)} className="mt-1.5 text-xs" rows={2} placeholder="Meta açıklama" />
            <p className="text-[10px] text-muted-foreground mt-1">{(form.meta_description || '').length}/160</p>
          </div>
          <div className="sm:col-span-2">
            <Label className="text-xs">SEO Description (alternatif)</Label>
            <Textarea value={form.seo_description || ''} onChange={e => set('seo_description', e.target.value)} className="mt-1.5 text-xs" rows={2} placeholder="Alternatif açıklama" />
          </div>
        </div>
      </div>

      {/* AI Summary */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
          <BrainCircuit className="w-4 h-4 text-primary" /> AI Özet (ai_summary)
        </h3>
        <Textarea
          value={form.ai_summary || ''}
          onChange={e => set('ai_summary', e.target.value)}
          className="text-xs min-h-[80px]"
          placeholder="AI tarafından üretilen kısa özet..."
        />
        {form.ai_summary && (
          <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Önizleme</span>
            <p className="text-[12px] text-slate-700 leading-relaxed line-clamp-3">{form.ai_summary}</p>
          </div>
        )}
      </div>

      {/* SEO Content */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
          <Search className="w-4 h-4 text-primary" /> SEO Content (uzun form)
        </h3>
        <Textarea
          value={form.seo_content || ''}
          onChange={e => set('seo_content', e.target.value)}
          className="text-xs min-h-[180px]"
          placeholder="SEO içeriği (HTML veya markdown) — AI veya JSON kutusundan otomatik doldurulur"
        />
        {form.seo_content && (
          <div className="bg-slate-50/50 border border-slate-100 rounded-lg p-3 max-h-[300px] overflow-y-auto">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Önizleme</span>
            <div className="prose prose-sm max-w-none text-slate-800 [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold [&_p]:text-xs [&_li]:text-xs" dangerouslySetInnerHTML={{ __html: form.seo_content }} />
          </div>
        )}
      </div>

      {/* Hızlı Bilgiler */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
          <Info className="w-4 h-4 text-primary" /> Hızlı Bilgiler (hizli_bilgiler)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HIZLI_BILGILER_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <Label className="text-[11px] font-bold text-slate-500">{label}</Label>
              <Input
                value={form.hizli_bilgiler?.[key] || ''}
                onChange={e => setHizliBilgi(key, e.target.value)}
                placeholder={placeholder}
                className="mt-1.5 text-xs bg-slate-50/40"
              />
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-primary" /> Sıkça Sorulan Sorular (faq)
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={handleAddFaq} className="h-8 rounded-lg border-teal-500/30 text-teal-600 font-semibold text-xs hover:bg-teal-50/50 gap-1">
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Soru Ekle
          </Button>
        </div>
        {(!form.faq || form.faq.length === 0) ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-6 text-center text-xs text-muted-foreground bg-slate-50/30">
            Henüz FAQ sorusu eklenmedi. "Soru Ekle" butonuyla başlayın veya JSON kutusundan aktarın.
          </div>
        ) : (
          <div className="space-y-3">
            {form.faq.map((item, index) => (
              <div key={index} className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Soru #{index + 1}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFaq(index)} className="text-rose-500 hover:text-rose-700 h-7 px-2 gap-1 text-xs">
                    <Trash2 className="w-3.5 h-3.5" /> Sil
                  </Button>
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-500">Soru</Label>
                  <Input value={item.q || ''} onChange={e => setFaqValue(index, 'q', e.target.value)} placeholder="Örn: Bu proje yatırım için uygun mu?" className="mt-1 text-xs bg-white" />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-slate-500">Cevap</Label>
                  <textarea value={item.a || ''} onChange={e => setFaqValue(index, 'a', e.target.value)} placeholder="Cevap metni..." className="mt-1 w-full min-h-[70px] rounded-lg border border-input bg-white px-3 py-2 text-xs resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/20 focus:border-teal-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* JSON-LD */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
          <Braces className="w-4 h-4 text-primary" /> JSON-LD Şeması (json_ld_schema)
        </h3>
        <textarea
          value={jsonLdText}
          onChange={e => setJsonLdText(e.target.value)}
          placeholder='{"@context": "https://schema.org", "@graph": [...]}'
          className="w-full min-h-[220px] rounded-xl border border-input bg-slate-900 text-emerald-300 px-3 py-2.5 text-[11px] font-mono resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 focus:border-teal-500"
        />
        <div className="flex items-center gap-2">
          <Button type="button" onClick={handleApplyJsonLd} className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 rounded-xl transition-all shadow-xs gap-2">
            <CheckCircle className="w-3.5 h-3.5" /> Şemayı Doğrula ve Uygula
          </Button>
          {jsonLdError ? (
            <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Geçersiz JSON: {jsonLdError}
            </span>
          ) : form.json_ld_schema ? (
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Şema geçerli ve uygulandı
            </span>
          ) : null}
        </div>
        {form.json_ld_schema && (
          <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 max-h-[300px] overflow-y-auto">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Uygulanan Şema Önizlemesi</span>
            <pre className="text-[10px] text-slate-700 whitespace-pre-wrap break-all font-mono">{JSON.stringify(form.json_ld_schema, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
