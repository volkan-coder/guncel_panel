/*
# Create leads table

1. Overview
Single-tenant no-auth real-estate CMS. Leads are inquiries from the public contact form,
property inquiry buttons, citizenship/residency pages, etc. The admin panel reads and
manages them; the public site creates them. All policies use `TO anon, authenticated` so
the anon-key frontend can insert leads and the admin (also anon-key) can read/update them.

2. New Table: leads
- id, full_name (required), email (required), phone, nationality, source, status, interest,
  budget_min, budget_max, preferred_city, message, notes, assigned_agent, property_ref,
  follow_up_date, created_at, updated_at.

3. Security
- RLS enabled.
- anon + authenticated full CRUD (single-tenant, intentionally shared data).

4. Notes
- `source` and `status` and `interest` are plain text with CHECK constraints to keep them
  aligned with the Lead entity enum values. New values can be added by altering the
  constraint later without data loss.
- `follow_up_date` is a date (not timestamptz) to match the entity's date format.
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  nationality text,
  source text NOT NULL DEFAULT 'contact-form'
    CHECK (source IN ('contact-form','property-inquiry','citizenship-page','residency-page','package-inquiry','sell-property','other')),
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','contacted','qualified','proposal','closed','lost')),
  interest text
    CHECK (interest IS NULL OR interest IN ('buy','citizenship','residency','investment','rent','sell','other')),
  budget_min numeric,
  budget_max numeric,
  preferred_city text,
  message text,
  notes text,
  assigned_agent text,
  property_ref text,
  follow_up_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_leads" ON leads;
CREATE POLICY "anon_select_leads" ON leads FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_leads" ON leads;
CREATE POLICY "anon_insert_leads" ON leads FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_leads" ON leads;
CREATE POLICY "anon_update_leads" ON leads FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_leads" ON leads;
CREATE POLICY "anon_delete_leads" ON leads FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at);
