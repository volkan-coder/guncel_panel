/*
# Create content tables: properties, projects, packages, blog_posts

1. Overview
Single-tenant no-auth real-estate CMS. All policies use `TO anon, authenticated` so the
anon-key frontend can read and write. See the first migration for the full rationale.

2. New Tables

### properties
The main listings table. Combines the Property entity fields with the extra fields the
PropertyForm / PropertyForm2 pages write (room_types, hizli_bilgiler, faq, json_ld_schema,
distances, lat/lng, payment split, market status, etc.).
- id, title (required), slug, status, type, sub_type, city (required), district,
  neighborhood, country, lat, lng, price (required), currency, bedrooms, bathrooms,
  size_sqm, total_sqm, balcony, salon, floor_number, floor_count, block_count,
  year_built / construction_year, floors, market_status, old_price, commission, boost,
  sea_view, seafront, near_the_sea, citizenship_eligible, residency_eligible, featured,
  description, features (text[]), images (text[]), main_image, room_types (jsonb),
  hizli_bilgiler (jsonb), faq (jsonb), json_ld_schema (jsonb), distances (jsonb),
  translations (jsonb), project_name, developer_company, property_ref / custom_id,
  payment_down, payment_under_construction, payment_delivery, payment_installment,
  list_link_1, list_link_2, notes, selected_airport_name, country_visible, city_visible,
  district_visible, neighborhood_visible, seo_title, seo_description, seo_keywords,
  meta_title, meta_description, seo_content, ai_summary, mulk_ozellikleri,
  proje_ozellikleri, lokasyon_avantajlari, yatirim_analizi, bolge_analizi,
  emlak_uzmani_gorusu, agent_id, created_at, updated_at.

### projects
Developments. Fields: id, title (required), slug, status, city (required), district,
developer, completion_date, min_price, max_price, currency, total_units,
available_units, description, features (text[]), images (text[]), main_image,
citizenship_eligible, featured, seo_title, seo_description, seo_keywords, created_at.

### packages
Citizenship / residency / investment bundles. Fields: id, title (required), slug,
status, type, total_price (required), currency, property_ids (text[]), cities (text[]),
description, benefits (text[]), main_image, images (text[]), seo_title, seo_description,
featured, number_of_properties, created_at.

### blog_posts
Articles. Fields: id, title (required), slug, type (required), status, category,
author, excerpt, content, main_image, tags (text[]), published_date, seo_title,
seo_description, seo_keywords, featured, reading_time_min, created_at.

3. Security
- RLS enabled on every table.
- anon + authenticated full CRUD (single-tenant, intentionally shared data).

4. Notes
- `room_types`, `hizli_bilgiler`, `faq`, `json_ld_schema`, `distances`, `translations`
  are stored as jsonb so the frontend can keep its nested shape without a join.
- `features`, `images`, `tags`, `benefits`, `property_ids`, `cities`, `sub_types` are
  text[] arrays of slugs/ids/strings.
- `order` is reserved, so it is double-quoted where used.
- `updated_at` on properties is maintained by the frontend; no trigger is added to keep
  the migration idempotent and side-effect free.
*/

-- properties
CREATE TABLE IF NOT EXISTS properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  status text NOT NULL DEFAULT 'draft',
  type text NOT NULL DEFAULT 'apartment',
  sub_type text,
  city text NOT NULL,
  district text,
  neighborhood text,
  country text NOT NULL DEFAULT 'Türkiye',
  lat text,
  lng text,
  price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  bedrooms integer,
  bathrooms integer,
  size_sqm numeric,
  total_sqm numeric,
  balcony text,
  salon text,
  floor_number text,
  floor_count text,
  block_count text,
  year_built integer,
  construction_year text,
  floors integer,
  market_status text NOT NULL DEFAULT 'For Sale',
  old_price numeric,
  commission text,
  boost text NOT NULL DEFAULT 'Default',
  sea_view boolean NOT NULL DEFAULT false,
  seafront boolean NOT NULL DEFAULT false,
  near_the_sea boolean NOT NULL DEFAULT false,
  citizenship_eligible boolean NOT NULL DEFAULT false,
  residency_eligible boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  description text,
  features text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  main_image text,
  room_types jsonb NOT NULL DEFAULT '[]',
  hizli_bilgiler jsonb NOT NULL DEFAULT '{}',
  faq jsonb NOT NULL DEFAULT '[]',
  json_ld_schema jsonb,
  distances jsonb NOT NULL DEFAULT '[]',
  translations jsonb NOT NULL DEFAULT '{}',
  project_name text,
  developer_company text,
  property_ref text,
  custom_id text,
  payment_down integer NOT NULL DEFAULT 100,
  payment_under_construction integer NOT NULL DEFAULT 0,
  payment_delivery integer NOT NULL DEFAULT 0,
  payment_installment integer NOT NULL DEFAULT 0,
  list_link_1 text,
  list_link_2 text,
  notes text,
  selected_airport_name text,
  country_visible boolean NOT NULL DEFAULT true,
  city_visible boolean NOT NULL DEFAULT true,
  district_visible boolean NOT NULL DEFAULT true,
  neighborhood_visible boolean NOT NULL DEFAULT true,
  seo_title text,
  seo_description text,
  seo_keywords text,
  meta_title text,
  meta_description text,
  seo_content text,
  ai_summary text,
  mulk_ozellikleri text,
  proje_ozellikleri text,
  lokasyon_avantajlari text,
  yatirim_analizi text,
  bolge_analizi text,
  emlak_uzmani_gorusu text,
  agent_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_properties" ON properties;
CREATE POLICY "anon_select_properties" ON properties FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_properties" ON properties;
CREATE POLICY "anon_insert_properties" ON properties FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_properties" ON properties;
CREATE POLICY "anon_update_properties" ON properties FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_properties" ON properties;
CREATE POLICY "anon_delete_properties" ON properties FOR DELETE
  TO anon, authenticated USING (true);

-- projects
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  status text NOT NULL DEFAULT 'draft',
  city text NOT NULL,
  district text,
  developer text,
  completion_date date,
  min_price numeric,
  max_price numeric,
  currency text NOT NULL DEFAULT 'USD',
  total_units integer,
  available_units integer,
  description text,
  features text[] NOT NULL DEFAULT '{}',
  images text[] NOT NULL DEFAULT '{}',
  main_image text,
  citizenship_eligible boolean NOT NULL DEFAULT false,
  featured boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  seo_keywords text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_projects" ON projects;
CREATE POLICY "anon_select_projects" ON projects FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_projects" ON projects;
CREATE POLICY "anon_insert_projects" ON projects FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_projects" ON projects;
CREATE POLICY "anon_update_projects" ON projects FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_projects" ON projects;
CREATE POLICY "anon_delete_projects" ON projects FOR DELETE
  TO anon, authenticated USING (true);

-- packages
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  status text NOT NULL DEFAULT 'draft',
  type text NOT NULL DEFAULT 'citizenship',
  total_price numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  property_ids text[] NOT NULL DEFAULT '{}',
  cities text[] NOT NULL DEFAULT '{}',
  description text,
  benefits text[] NOT NULL DEFAULT '{}',
  main_image text,
  images text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  featured boolean NOT NULL DEFAULT false,
  number_of_properties integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_packages" ON packages;
CREATE POLICY "anon_select_packages" ON packages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_packages" ON packages;
CREATE POLICY "anon_insert_packages" ON packages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_packages" ON packages;
CREATE POLICY "anon_update_packages" ON packages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_packages" ON packages;
CREATE POLICY "anon_delete_packages" ON packages FOR DELETE
  TO anon, authenticated USING (true);

-- blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text,
  type text NOT NULL DEFAULT 'blog',
  status text NOT NULL DEFAULT 'draft',
  category text,
  author text,
  excerpt text,
  content text,
  main_image text,
  tags text[] NOT NULL DEFAULT '{}',
  published_date date,
  seo_title text,
  seo_description text,
  seo_keywords text,
  featured boolean NOT NULL DEFAULT false,
  reading_time_min integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_blog_posts" ON blog_posts;
CREATE POLICY "anon_select_blog_posts" ON blog_posts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_blog_posts" ON blog_posts;
CREATE POLICY "anon_insert_blog_posts" ON blog_posts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_blog_posts" ON blog_posts;
CREATE POLICY "anon_update_blog_posts" ON blog_posts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_blog_posts" ON blog_posts;
CREATE POLICY "anon_delete_blog_posts" ON blog_posts FOR DELETE
  TO anon, authenticated USING (true);

-- indexes for common listing filters
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties (city);
CREATE INDEX IF NOT EXISTS idx_properties_type ON properties (type);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties (featured);
CREATE INDEX IF NOT EXISTS idx_properties_slug ON properties (slug);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_city ON projects (city);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages (status);
CREATE INDEX IF NOT EXISTS idx_packages_type ON packages (type);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts (status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_type ON blog_posts (type);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts (slug);
