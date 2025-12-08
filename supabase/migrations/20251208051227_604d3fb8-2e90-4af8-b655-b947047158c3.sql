-- Create table to track subscription interest clicks
CREATE TABLE public.subscription_interest (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'settings_click', 'modal_subscribe_click'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable Row Level Security
ALTER TABLE public.subscription_interest ENABLE ROW LEVEL SECURITY;

-- Users can insert their own interest records
CREATE POLICY "Users can log their own subscription interest"
ON public.subscription_interest
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own interest records (for potential analytics display)
CREATE POLICY "Users can view their own subscription interest"
ON public.subscription_interest
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all interest records for analytics
CREATE POLICY "Admins can view all subscription interest"
ON public.subscription_interest
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient querying
CREATE INDEX idx_subscription_interest_user_id ON public.subscription_interest(user_id);
CREATE INDEX idx_subscription_interest_action_type ON public.subscription_interest(action_type);
CREATE INDEX idx_subscription_interest_created_at ON public.subscription_interest(created_at DESC);