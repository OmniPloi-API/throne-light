-- Add page_path column to tracking_events table
-- This allows us to track which specific page was visited and attribute it to the correct "conceptual domain"

ALTER TABLE tracking_events
ADD COLUMN page_path TEXT;

-- Add index for faster queries on page_path
CREATE INDEX idx_tracking_events_page_path ON tracking_events(page_path);

-- Add comment explaining the column
COMMENT ON COLUMN tracking_events.page_path IS 'The URL path visited (e.g., /author, /book, /publisher) for domain attribution in analytics';
