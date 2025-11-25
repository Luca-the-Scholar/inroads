-- Add privacy settings to profiles table
ALTER TABLE public.profiles
ADD COLUMN profile_visibility text DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends_only', 'private')),
ADD COLUMN show_practice_history boolean DEFAULT true,
ADD COLUMN show_streak_to_friends boolean DEFAULT true,
ADD COLUMN show_techniques_to_friends boolean DEFAULT true,
ADD COLUMN share_health_data_for_research boolean DEFAULT false;

-- Create mock health metrics table for UX demonstration
CREATE TABLE public.mock_health_metrics (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_date date NOT NULL,
  heart_rate_avg integer,
  heart_rate_resting integer,
  sleep_hours numeric(4,2),
  steps integer,
  mindful_minutes integer,
  energy_level integer CHECK (energy_level BETWEEN 1 AND 5),
  stress_level integer CHECK (stress_level BETWEEN 1 AND 5),
  mood_score integer CHECK (mood_score BETWEEN 1 AND 5),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, metric_date)
);

-- Enable RLS on mock health metrics
ALTER TABLE public.mock_health_metrics ENABLE ROW LEVEL SECURITY;

-- Users can view their own health metrics
CREATE POLICY "Users can view their own health metrics"
ON public.mock_health_metrics
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own health metrics
CREATE POLICY "Users can insert their own health metrics"
ON public.mock_health_metrics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own health metrics
CREATE POLICY "Users can update their own health metrics"
ON public.mock_health_metrics
FOR UPDATE
USING (auth.uid() = user_id);

-- Create function to get user's public profile stats
CREATE OR REPLACE FUNCTION public.get_user_profile_stats(profile_user_id uuid)
RETURNS TABLE (
  total_minutes integer,
  current_streak integer,
  total_sessions integer,
  recent_techniques jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_visibility text;
  requester_is_friend boolean := false;
BEGIN
  -- Get the profile visibility setting
  SELECT profile_visibility INTO user_visibility
  FROM public.profiles
  WHERE id = profile_user_id;

  -- Check if requester is a friend
  IF auth.uid() != profile_user_id THEN
    SELECT EXISTS (
      SELECT 1 FROM public.friendships
      WHERE ((user_id = auth.uid() AND friend_id = profile_user_id) 
         OR (user_id = profile_user_id AND friend_id = auth.uid()))
        AND status = 'accepted'
    ) INTO requester_is_friend;
  END IF;

  -- Return stats based on visibility settings
  IF profile_user_id = auth.uid() 
     OR user_visibility = 'public' 
     OR (user_visibility = 'friends_only' AND requester_is_friend) THEN
    
    RETURN QUERY
    SELECT 
      COALESCE(SUM(s.duration_minutes)::integer, 0) as total_minutes,
      COALESCE(MAX(ms.streak), 0) as current_streak,
      COUNT(s.id)::integer as total_sessions,
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'technique_name', t.name,
            'total_minutes', COALESCE(SUM(s2.duration_minutes), 0),
            'session_count', COUNT(s2.id)
          )
          ORDER BY MAX(s2.session_date) DESC
        )
        FROM public.sessions s2
        JOIN public.techniques t ON t.id = s2.technique_id
        WHERE s2.user_id = profile_user_id
        GROUP BY t.id, t.name
        LIMIT 3
      ) as recent_techniques
    FROM public.sessions s
    LEFT JOIN public.mastery_scores ms ON ms.user_id = profile_user_id
    WHERE s.user_id = profile_user_id;
  ELSE
    -- Return empty stats for private profiles
    RETURN QUERY SELECT 0, 0, 0, '[]'::jsonb;
  END IF;
END;
$$;