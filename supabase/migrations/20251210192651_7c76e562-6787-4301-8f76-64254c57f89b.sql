-- Enable realtime for network_configurations table
ALTER TABLE public.network_configurations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.network_configurations;

-- Enable pg_cron and pg_net extensions for scheduled health checks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;