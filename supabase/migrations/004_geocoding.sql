-- Add geocoding columns to profiles/users for map visualization
-- These columns store pre-computed lat/long from city/country

-- Add latitude and longitude columns to active_reader_sessions
ALTER TABLE active_reader_sessions 
ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS country_code TEXT;

-- Create a profiles table if it doesn't exist (for user location data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  country_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick geo lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_geo ON user_profiles(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON user_profiles(country_code);

-- Create a table for sales/orders with location data
CREATE TABLE IF NOT EXISTS sales_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT,
  user_id TEXT,
  email TEXT,
  product_id TEXT,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  city TEXT,
  state TEXT,
  country TEXT,
  country_code TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_locations_geo ON sales_locations(latitude, longitude) WHERE latitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_sales_locations_country ON sales_locations(country_code);
CREATE INDEX IF NOT EXISTS idx_sales_locations_created ON sales_locations(created_at);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_locations ENABLE ROW LEVEL SECURITY;

-- Policies for service role
CREATE POLICY "Service role can manage user_profiles"
  ON user_profiles FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage sales_locations"
  ON sales_locations FOR ALL USING (true) WITH CHECK (true);

-- View for aggregated sales by location (for map markers)
CREATE OR REPLACE VIEW sales_by_location AS
SELECT 
  city,
  country,
  country_code,
  latitude,
  longitude,
  COUNT(*) as sale_count,
  SUM(amount) as total_amount
FROM sales_locations
WHERE latitude IS NOT NULL
GROUP BY city, country, country_code, latitude, longitude;

-- View for active readers by location
CREATE OR REPLACE VIEW readers_by_location AS
SELECT 
  city,
  country,
  country_code,
  latitude,
  longitude,
  COUNT(*) as reader_count
FROM active_reader_sessions
WHERE is_active = TRUE 
  AND latitude IS NOT NULL
  AND last_heartbeat > NOW() - INTERVAL '5 minutes'
GROUP BY city, country, country_code, latitude, longitude;
