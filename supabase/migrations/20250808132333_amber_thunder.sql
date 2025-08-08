/*
  # Create pledges table for Arc petition

  1. New Tables
    - `pledges`
      - `id` (uuid, primary key)
      - `name` (text, required) - User's name
      - `monthly_amount` (numeric, required) - Price suggestion in dollars
      - `created_at` (timestamp) - When the pledge was created

  2. Security
    - Enable RLS on `pledges` table
    - Add policy for anyone to insert pledges (public form)
    - Add policy for anyone to read pledges (public stats)
*/

CREATE TABLE IF NOT EXISTS pledges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  monthly_amount numeric(10,2) NOT NULL CHECK (monthly_amount > 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE pledges ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert pledges (public form submission)
CREATE POLICY "Anyone can create pledges"
  ON pledges
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read pledges (for public stats and recent submissions)
CREATE POLICY "Anyone can read pledges"
  ON pledges
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create index for better performance on created_at queries
CREATE INDEX IF NOT EXISTS pledges_created_at_idx ON pledges (created_at DESC);