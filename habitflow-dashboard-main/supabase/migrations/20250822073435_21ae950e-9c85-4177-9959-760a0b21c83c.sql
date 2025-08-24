-- Deduplicate habit_progress rows keeping the most recently updated per (user_id, habit_id, date)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY user_id, habit_id, date
           ORDER BY updated_at DESC, created_at DESC, id DESC
         ) AS rn
  FROM public.habit_progress
)
DELETE FROM public.habit_progress hp
USING ranked r
WHERE hp.id = r.id AND r.rn > 1;

-- Add a unique constraint to ensure one progress row per user/habit/day
ALTER TABLE public.habit_progress
ADD CONSTRAINT habit_progress_unique_user_habit_date
UNIQUE (user_id, habit_id, date);
