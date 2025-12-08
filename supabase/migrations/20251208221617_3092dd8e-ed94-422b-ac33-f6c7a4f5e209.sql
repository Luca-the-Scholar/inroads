-- Allow admins to delete techniques from the global library
CREATE POLICY "Admins can delete techniques"
ON public.global_techniques
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));