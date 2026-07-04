/*
# Add SEO studio columns to projects and blog_posts

1. Overview
The PropertyForm2 page has a full SEO studio (meta_title, meta_description, seo_content,
ai_summary, long-form SEO sections, FAQ, hizli_bilgiler, json_ld_schema). This migration
brings projects and blog_posts to the same level so the new shared SeoContentStudio
component can drive all three entity types (projects, blog/news/guide posts).

2. Modified Tables

### projects (added columns)
- meta_title text           — distinct from seo_title, used for <title> tag
- meta_description text     — distinct from seo_description, used for <meta name="description">
- seo_content text          — long-form SEO article body (HTML/markdown)
- ai_summary text           — short AI-generated summary
- faq jsonb DEFAULT '[]'    — [{q,a}] FAQ pairs for FAQPage schema
- hizli_bilgiler jsonb DEFAULT '{}' — quick-facts key/value object
- json_ld_schema jsonb      — structured data for <script type="application/ld+json">
- updated_at timestamptz    — maintained by frontend

### blog_posts (added columns)
- meta_title text
- meta_description text
- seo_content text
- ai_summary text
- faq jsonb DEFAULT '[]'
- hizli_bilgiler jsonb DEFAULT '{}'
- json_ld_schema jsonb
- updated_at timestamptz

3. Security
- No RLS policy changes. Existing anon+authenticated CRUD policies already cover the new
  columns (they are not row-restricted).

4. Notes
- All additions are additive (ALTER TABLE ADD COLUMN IF NOT EXISTS) — no data loss.
- jsonb defaults match the properties table conventions ('[]' for arrays, '{}' for objects).
*/

-- projects: SEO studio columns
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS seo_content text,
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS hizli_bilgiler jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS json_ld_schema jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- blog_posts: SEO studio columns
ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS meta_title text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS seo_content text,
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS faq jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS hizli_bilgiler jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS json_ld_schema jsonb,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
