
-- Add status to transactions
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'rejected');

ALTER TABLE public.transactions 
ADD COLUMN status public.transaction_status NOT NULL DEFAULT 'completed';

-- Allow admins to update transactions (for approving/rejecting and editing)
CREATE POLICY "Admins can update all transactions"
ON public.transactions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Make sladavictor@gmail.com an admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'sladavictor@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
