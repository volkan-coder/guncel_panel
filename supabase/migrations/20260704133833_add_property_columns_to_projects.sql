/*
# Add property-like columns to projects table

1. Overview
The user wants ProjectForm to be a 100% copy of PropertyForm2 (the property listing form).
PropertyForm2 writes many columns that the projects table does not yet have. This migration
adds those columns to projects so the same form can drive both entities without data loss.

2. Modified Table: projects (added columns)
- sub_type text
- price numeric
- old_price numeric
- commission text
- bedrooms integer
- bathrooms integer
- size_sqm numeric
- balcony text
- salon text
- floor_number text
- floor_count text
- block_count text
- total_sqm numeric
- construction_year text
- market_status text DEFAULT 'For Sale'
- boost text DEFAULT 'Default'
- sea_view boolean DEFAULT false
- seafront boolean DEFAULT false
- near_the_sea boolean DEFAULT false
- residency_eligible boolean DEFAULT false
- neighborhood text
- country text DEFAULT 'Türkiye'
- lat text
- lng text
- distances jsonb DEFAULT '[]'
- room_types jsonb DEFAULT '[]'
- features text[] DEFAULT '{}'
- project_name text
- developer_company text
- property_ref text
- custom_id text
- payment_down integer DEFAULT 100
- payment_under_construction integer DEFAULT 0
- payment_delivery integer DEFAULT 0
- payment_installment integer DEFAULT 0
- list_link_1 text
- list_link_2 text
- notes text
- selected_airport_name text
- country_visible boolean DEFAULT true
- city_visible boolean DEFAULT true
- district_visible boolean DEFAULT true
- neighborhood_visible boolean DEFAULT true
- mulk_ozellikleri text
- proje_ozellikleri text
- lokasyon_avantajlari text
- yatirim_analizi text
- bolge_analizi text
- emlak_uzmani_gorusu text
- agent_id text

3. Security
- No RLS changes. Existing anon+authenticated CRUD policies cover new columns.

4. Notes
- All additive (ADD COLUMN IF NOT EXISTS). No data loss.
- Defaults match the properties table conventions.
*/

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS sub_type text,
  ADD COLUMN IF NOT EXISTS price numeric,
  ADD COLUMN IF NOT EXISTS old_price numeric,
  ADD COLUMN IF NOT EXISTS commission text,
  ADD COLUMN IF NOT EXISTS bedrooms integer,
  ADD COLUMN IF NOT EXISTS bathrooms integer,
  ADD COLUMN IF NOT EXISTS size_sqm numeric,
  ADD COLUMN IF NOT EXISTS balcony text,
  ADD COLUMN IF NOT EXISTS salon text,
  ADD COLUMN IF NOT EXISTS floor_number text,
  ADD COLUMN IF NOT EXISTS floor_count text,
  ADD COLUMN IF NOT EXISTS block_count text,
  ADD COLUMN IF NOT EXISTS total_sqm numeric,
  ADD COLUMN IF NOT EXISTS construction_year text,
  ADD COLUMN IF NOT EXISTS market_status text NOT NULL DEFAULT 'For Sale',
  ADD COLUMN IF NOT EXISTS boost text NOT NULL DEFAULT 'Default',
  ADD COLUMN IF NOT EXISTS sea_view boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS seafront boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS near_the_sea boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS residency_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS neighborhood text,
  ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT 'Türkiye',
  ADD COLUMN IF NOT EXISTS lat text,
  ADD COLUMN IF NOT EXISTS lng text,
  ADD COLUMN IF NOT EXISTS distances jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS room_types jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS features text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS project_name text,
  ADD COLUMN IF NOT EXISTS developer_company text,
  ADD COLUMN IF NOT EXISTS property_ref text,
  ADD COLUMN IF NOT EXISTS custom_id text,
  ADD COLUMN IF NOT EXISTS payment_down integer NOT NULL DEFAULT 100,
  ADD COLUMN IF NOT EXISTS payment_under_construction integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_delivery integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_installment integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS list_link_1 text,
  ADD COLUMN IF NOT EXISTS list_link_2 text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS selected_airport_name text,
  ADD COLUMN IF NOT EXISTS country_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS city_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS district_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS neighborhood_visible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS mulk_ozellikleri text,
  ADD COLUMN IF NOT EXISTS proje_ozellikleri text,
  ADD COLUMN IF NOT EXISTS lokasyon_avantajlari text,
  ADD COLUMN IF NOT EXISTS yatirim_analizi text,
  ADD COLUMN IF NOT EXISTS bolge_analisi text,
  ADD COLUMN IF NOT EXISTS emlak_uzmani_gorusu text,
  ADD COLUMN IF NOT EXISTS agent_id text;
