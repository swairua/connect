-- Add test_mode column to network_configurations
ALTER TABLE public.network_configurations 
ADD COLUMN test_mode text NOT NULL DEFAULT 'cloud' 
CHECK (test_mode IN ('cloud', 'local'));