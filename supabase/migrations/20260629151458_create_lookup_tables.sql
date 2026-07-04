/*
# Create lookup tables (single-tenant, no auth)

1. Overview
This is a real-estate CMS with a public site + admin panel. The app has no real sign-in
(AuthContext hardcodes an admin user), so this is a single-tenant no-auth app. All policies
use `TO anon, authenticated` so the anon-key frontend can read and write its own data.

2. New Tables
- `features` — property amenities catalog (Pool, Sea View, etc.). Seeded by the frontend
  Features page. Fields: id, name (unique), slug (unique, generated from name), category,
  emoji, icon, is_active, "order", created_at.
- `property_types` — top-level property categories (Apartment, Villa, etc.). Fields: id,
  name, slug, icon, sub_types (text[]), is_active, "order", created_at.
- `locations` — city/district/neighborhood reference used by the property form. Fields:
  id, country, city, city_label, region, district, neighborhood, property_count, is_active,
  "order", created_at.
- `languages` — supported UI languages. Fields: id, name, code (unique), native_name,
  is_active, is_default, rtl, flag_emoji, "order", created_at.
- `site_settings` — key/value store for global site config (background image, contact
  info, etc.). Fields: id, key (unique), value, label, created_at, updated_at.

3. Security
- RLS enabled on every table.
- All tables allow anon + authenticated full CRUD because the app is single-tenant and
  the data is intentionally shared across the single admin operator and the public site.

4. Notes
- `slug` columns are UNIQUE and generated client-side from the name (lowercase, non-alnum
  replaced with underscores). The Features page already does this.
- `order` is a reserved word in SQL so it is double-quoted everywhere.
- `created_at` defaults to now() on all tables.
*/

-- features
CREATE TABLE IF NOT EXISTS features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL DEFAULT 'other',
  emoji text,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 99,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE features ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_features" ON features;
CREATE POLICY "anon_select_features" ON features FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_features" ON features;
CREATE POLICY "anon_insert_features" ON features FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_features" ON features;
CREATE POLICY "anon_update_features" ON features FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_features" ON features;
CREATE POLICY "anon_delete_features" ON features FOR DELETE
  TO anon, authenticated USING (true);

-- property_types
CREATE TABLE IF NOT EXISTS property_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  icon text,
  sub_types text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE property_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_property_types" ON property_types;
CREATE POLICY "anon_select_property_types" ON property_types FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_property_types" ON property_types;
CREATE POLICY "anon_insert_property_types" ON property_types FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_property_types" ON property_types;
CREATE POLICY "anon_update_property_types" ON property_types FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_property_types" ON property_types;
CREATE POLICY "anon_delete_property_types" ON property_types FOR DELETE
  TO anon, authenticated USING (true);

-- locations
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL DEFAULT 'Turkey',
  city text NOT NULL,
  city_label text,
  region text,
  district text NOT NULL,
  neighborhood text,
  property_count integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  "order" integer NOT NULL DEFAULT 99,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_locations" ON locations;
CREATE POLICY "anon_select_locations" ON locations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_locations" ON locations;
CREATE POLICY "anon_insert_locations" ON locations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_locations" ON locations;
CREATE POLICY "anon_update_locations" ON locations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_locations" ON locations;
CREATE POLICY "anon_delete_locations" ON locations FOR DELETE
  TO anon, authenticated USING (true);

-- languages
CREATE TABLE IF NOT EXISTS languages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  native_name text,
  is_active boolean NOT NULL DEFAULT true,
  is_default boolean NOT NULL DEFAULT false,
  rtl boolean NOT NULL DEFAULT false,
  flag_emoji text,
  "order" integer NOT NULL DEFAULT 99,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE languages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_languages" ON languages;
CREATE POLICY "anon_select_languages" ON languages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_languages" ON languages;
CREATE POLICY "anon_insert_languages" ON languages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_languages" ON languages;
CREATE POLICY "anon_update_languages" ON languages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_languages" ON languages;
CREATE POLICY "anon_delete_languages" ON languages FOR DELETE
  TO anon, authenticated USING (true);

-- site_settings
CREATE TABLE IF NOT EXISTS site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_site_settings" ON site_settings;
CREATE POLICY "anon_select_site_settings" ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_site_settings" ON site_settings;
CREATE POLICY "anon_insert_site_settings" ON site_settings FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_site_settings" ON site_settings;
CREATE POLICY "anon_update_site_settings" ON site_settings FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_site_settings" ON site_settings;
CREATE POLICY "anon_delete_site_settings" ON site_settings FOR DELETE
  TO anon, authenticated USING (true);

-- helpful indexes
CREATE INDEX IF NOT EXISTS idx_features_slug ON features (slug);
CREATE INDEX IF NOT EXISTS idx_features_active ON features (is_active);
CREATE INDEX IF NOT EXISTS idx_property_types_slug ON property_types (slug);
CREATE INDEX IF NOT EXISTS idx_locations_city_district ON locations (city, district);
CREATE INDEX IF NOT EXISTS idx_languages_active ON languages (is_active);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings (key);
