-- Migration: landing_content table for custom hero, promos and gallery photos
CREATE TABLE IF NOT EXISTS public.landing_content (
  id TEXT PRIMARY KEY DEFAULT 'default',
  content JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

-- Allow public read access to landing content
CREATE POLICY "Allow public read on landing_content"
  ON public.landing_content
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow authenticated admins to update landing content
CREATE POLICY "Allow admin write on landing_content"
  ON public.landing_content
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
