-- Add effective_minutes to sessions table
ALTER TABLE public.sessions ADD COLUMN IF NOT EXISTS effective_minutes numeric DEFAULT 0;

-- Add cumulative_effective_minutes to mastery_scores
ALTER TABLE public.mastery_scores ADD COLUMN IF NOT EXISTS cumulative_effective_minutes numeric DEFAULT 0;

-- Add tracking for consecutive missed days at profile level
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS consecutive_missed_days integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_meditation_date date;

-- Function to calculate duration multiplier with linear interpolation
CREATE OR REPLACE FUNCTION public.calculate_duration_multiplier(duration_minutes integer)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  multiplier numeric;
BEGIN
  IF duration_minutes <= 30 THEN
    multiplier := 1.0;
  ELSIF duration_minutes <= 39 THEN
    -- Interpolate from 1.0 at 30 to 1.2 at 39
    multiplier := 1.0 + (duration_minutes - 30) * (1.2 - 1.0) / 9.0;
  ELSIF duration_minutes <= 49 THEN
    -- Interpolate from 1.2 at 39 to 1.4 at 49
    multiplier := 1.2 + (duration_minutes - 39) * (1.4 - 1.2) / 10.0;
  ELSIF duration_minutes <= 59 THEN
    -- Interpolate from 1.4 at 49 to 1.8 at 59
    multiplier := 1.4 + (duration_minutes - 49) * (1.8 - 1.4) / 10.0;
  ELSE
    -- Continue linear at rate of 0.04 per minute (same as 49-59 range)
    multiplier := 1.8 + (duration_minutes - 59) * 0.04;
  END IF;
  
  RETURN multiplier;
END;
$$;

-- Function to calculate mastery score from cumulative effective minutes
CREATE OR REPLACE FUNCTION public.calculate_mastery_from_minutes(cumulative_minutes numeric)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
  -- mastery = log(1 + cumulative_effective_minutes / 600000) × 100
  -- Cap at 100 for display purposes
  RETURN LEAST(100, LN(1 + cumulative_minutes / 600000.0) * 100);
END;
$$;

-- Updated function to update mastery after session
CREATE OR REPLACE FUNCTION public.update_mastery_after_session(p_user_id uuid, p_technique_id uuid, p_duration_minutes integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  multiplier DECIMAL;
  effective_mins DECIMAL;
  current_cumulative DECIMAL;
  new_mastery DECIMAL;
  current_streak INTEGER;
  last_practice TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate effective minutes using duration multiplier
  multiplier := calculate_duration_multiplier(p_duration_minutes);
  effective_mins := p_duration_minutes * multiplier;
  
  -- Get current cumulative and streak
  SELECT cumulative_effective_minutes, streak, last_practiced_at 
  INTO current_cumulative, current_streak, last_practice
  FROM public.mastery_scores
  WHERE user_id = p_user_id AND technique_id = p_technique_id;
  
  current_cumulative := COALESCE(current_cumulative, 0);
  
  -- Calculate new cumulative and mastery
  current_cumulative := current_cumulative + effective_mins;
  new_mastery := calculate_mastery_from_minutes(current_cumulative);
  
  -- Calculate new streak
  IF last_practice IS NULL THEN
    current_streak := 1;
  ELSIF last_practice < NOW() - INTERVAL '2 days' THEN
    current_streak := 1;
  ELSIF last_practice >= NOW() - INTERVAL '1 day' THEN
    current_streak := COALESCE(current_streak, 0) + 1;
  ELSE
    current_streak := COALESCE(current_streak, 1);
  END IF;
  
  INSERT INTO public.mastery_scores (user_id, technique_id, mastery_score, cumulative_effective_minutes, last_practiced_at, streak)
  VALUES (p_user_id, p_technique_id, new_mastery, current_cumulative, NOW(), current_streak)
  ON CONFLICT (user_id, technique_id) 
  DO UPDATE SET
    mastery_score = new_mastery,
    cumulative_effective_minutes = current_cumulative,
    last_practiced_at = NOW(),
    updated_at = NOW(),
    streak = current_streak;
    
  -- Update user's last meditation date and reset consecutive missed days
  UPDATE public.profiles 
  SET last_meditation_date = CURRENT_DATE, consecutive_missed_days = 0
  WHERE id = p_user_id;
END;
$$;

-- Function to apply decay with new rules
CREATE OR REPLACE FUNCTION public.apply_daily_decay()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_rec RECORD;
  mastery_rec RECORD;
  base_decay_rate DECIMAL;
  actual_decay_rate DECIMAL;
  missed_days_multiplier DECIMAL;
  new_cumulative DECIMAL;
  new_mastery DECIMAL;
BEGIN
  -- First, update consecutive_missed_days for users who didn't meditate yesterday
  UPDATE public.profiles
  SET consecutive_missed_days = consecutive_missed_days + 1
  WHERE last_meditation_date IS NULL 
     OR last_meditation_date < CURRENT_DATE - INTERVAL '1 day';

  -- Apply decay to each technique for users who missed meditation
  FOR user_rec IN 
    SELECT id, consecutive_missed_days 
    FROM public.profiles 
    WHERE last_meditation_date IS NULL 
       OR last_meditation_date < CURRENT_DATE
  LOOP
    -- Calculate missed days multiplier (10% compound increase per day)
    missed_days_multiplier := POWER(1.1, GREATEST(0, user_rec.consecutive_missed_days - 1));
    
    FOR mastery_rec IN
      SELECT id, mastery_score, cumulative_effective_minutes
      FROM public.mastery_scores
      WHERE user_id = user_rec.id
        AND mastery_score > 0
        AND (last_decay_applied_at IS NULL OR last_decay_applied_at < CURRENT_DATE)
    LOOP
      -- Calculate decay rate: 0.5% × (0.5 ^ floor(mastery / 10)) × missed_days_multiplier
      base_decay_rate := 0.5 * POWER(0.5, FLOOR(mastery_rec.mastery_score / 10));
      actual_decay_rate := base_decay_rate * missed_days_multiplier;
      
      -- Apply decay to cumulative minutes (reverse engineer from mastery)
      -- Decay the cumulative minutes proportionally
      new_cumulative := mastery_rec.cumulative_effective_minutes * (1 - actual_decay_rate / 100);
      new_mastery := calculate_mastery_from_minutes(new_cumulative);
      
      UPDATE public.mastery_scores
      SET 
        mastery_score = GREATEST(0, new_mastery),
        cumulative_effective_minutes = GREATEST(0, new_cumulative),
        last_decay_applied_at = CURRENT_DATE
      WHERE id = mastery_rec.id;
    END LOOP;
  END LOOP;
END;
$$;

-- Function to add/update a manual session entry
CREATE OR REPLACE FUNCTION public.add_manual_session(
  p_user_id uuid, 
  p_technique_id uuid, 
  p_duration_minutes integer,
  p_session_date date
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  multiplier DECIMAL;
  effective_mins DECIMAL;
  session_id uuid;
BEGIN
  -- Calculate effective minutes
  multiplier := calculate_duration_multiplier(p_duration_minutes);
  effective_mins := p_duration_minutes * multiplier;
  
  -- Insert session
  INSERT INTO public.sessions (user_id, technique_id, duration_minutes, effective_minutes, session_date, manual_entry)
  VALUES (p_user_id, p_technique_id, p_duration_minutes, effective_mins, p_session_date::timestamp with time zone, true)
  RETURNING id INTO session_id;
  
  -- Update mastery (recalculate from all sessions for this technique)
  PERFORM recalculate_technique_mastery(p_user_id, p_technique_id);
  
  RETURN session_id;
END;
$$;

-- Function to recalculate mastery from all sessions
CREATE OR REPLACE FUNCTION public.recalculate_technique_mastery(p_user_id uuid, p_technique_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_effective DECIMAL;
  new_mastery DECIMAL;
  current_streak INTEGER;
  last_session_date DATE;
BEGIN
  -- Sum all effective minutes for this technique
  SELECT COALESCE(SUM(
    CASE 
      WHEN effective_minutes > 0 THEN effective_minutes
      ELSE duration_minutes * calculate_duration_multiplier(duration_minutes)
    END
  ), 0)
  INTO total_effective
  FROM public.sessions
  WHERE user_id = p_user_id AND technique_id = p_technique_id;
  
  -- Calculate new mastery
  new_mastery := calculate_mastery_from_minutes(total_effective);
  
  -- Get latest session date for streak calculation
  SELECT session_date::date INTO last_session_date
  FROM public.sessions
  WHERE user_id = p_user_id AND technique_id = p_technique_id
  ORDER BY session_date DESC
  LIMIT 1;
  
  -- Update or insert mastery score
  INSERT INTO public.mastery_scores (user_id, technique_id, mastery_score, cumulative_effective_minutes, last_practiced_at, streak)
  VALUES (p_user_id, p_technique_id, new_mastery, total_effective, last_session_date, 1)
  ON CONFLICT (user_id, technique_id) 
  DO UPDATE SET
    mastery_score = new_mastery,
    cumulative_effective_minutes = total_effective,
    updated_at = NOW();
END;
$$;