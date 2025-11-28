-- Allow users to delete their own sessions (for manual entry management)
CREATE POLICY "Users can delete their own sessions" 
ON public.sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow users to update their own sessions (for editing manual entries)
CREATE POLICY "Users can update their own sessions" 
ON public.sessions 
FOR UPDATE 
USING (auth.uid() = user_id);