-- Add positions_required column to jobs
ALTER TABLE public.jobs
  ADD COLUMN positions_required INTEGER DEFAULT 1;

-- Backfill existing jobs if needed (already defaulted to 1)
UPDATE public.jobs SET positions_required = 1 WHERE positions_required IS NULL;
