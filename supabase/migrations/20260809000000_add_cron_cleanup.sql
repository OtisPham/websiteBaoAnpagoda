CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'cleanup_old_deleted_forms',
  '0 2 * * *',
   DELETE FROM public.forms WHERE deleted_at IS NOT NULL AND deleted_at < now() - interval '30 days'; 
);