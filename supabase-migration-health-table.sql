-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql/new)
-- Creates the health table used by the /api/health endpoint to keep the database active.

CREATE TABLE IF NOT EXISTS health (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow anonymous access for the health check endpoint
ALTER TABLE health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for health check"
  ON health
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow select for health check"
  ON health
  FOR SELECT
  TO anon
  USING (true);