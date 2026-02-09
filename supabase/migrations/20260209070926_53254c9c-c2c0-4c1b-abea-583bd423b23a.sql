
-- Add new profile fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS date_of_birth date,
ADD COLUMN IF NOT EXISTS home_address text,
ADD COLUMN IF NOT EXISTS nationality text;

-- Add currency and routing_number to customers
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS routing_number text;

-- Generate unique routing numbers for existing customers
CREATE OR REPLACE FUNCTION public.generate_routing_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    new_routing TEXT;
BEGIN
    LOOP
        new_routing := LPAD(FLOOR(RANDOM() * 1000000000)::TEXT, 9, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.customers WHERE routing_number = new_routing);
    END LOOP;
    RETURN new_routing;
END;
$$;

-- Trigger to auto-set routing number on new customers
CREATE OR REPLACE FUNCTION public.set_routing_number()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
    IF NEW.routing_number IS NULL OR NEW.routing_number = '' THEN
        NEW.routing_number := public.generate_routing_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_customer_routing_number
BEFORE INSERT ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.set_routing_number();

-- Set routing numbers for existing customers that don't have one
UPDATE public.customers SET routing_number = public.generate_routing_number() WHERE routing_number IS NULL;

-- Create virtual cards table
CREATE TABLE public.virtual_cards (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    card_number text NOT NULL,
    cvv text NOT NULL,
    expiry_month int NOT NULL,
    expiry_year int NOT NULL,
    is_frozen boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(customer_id)
);

ALTER TABLE public.virtual_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own virtual card"
ON public.virtual_cards FOR SELECT
USING (customer_id = get_customer_id(auth.uid()));

CREATE POLICY "Users can update their own virtual card"
ON public.virtual_cards FOR UPDATE
USING (customer_id = get_customer_id(auth.uid()));

CREATE POLICY "Admins can view all virtual cards"
ON public.virtual_cards FOR SELECT
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert virtual cards"
ON public.virtual_cards FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update virtual cards"
ON public.virtual_cards FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Auto-create virtual card when card_status becomes approved
CREATE OR REPLACE FUNCTION public.create_virtual_card_on_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    card_num TEXT;
BEGIN
    IF NEW.card_status = 'approved' AND (OLD.card_status IS NULL OR OLD.card_status != 'approved') THEN
        -- Generate a 16-digit card number
        card_num := LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0') || 
                    LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
        
        INSERT INTO public.virtual_cards (customer_id, card_number, cvv, expiry_month, expiry_year)
        VALUES (
            NEW.id,
            card_num,
            LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0'),
            EXTRACT(MONTH FROM (now() + interval '3 years'))::int,
            EXTRACT(YEAR FROM (now() + interval '3 years'))::int
        )
        ON CONFLICT (customer_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER create_virtual_card_trigger
AFTER UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.create_virtual_card_on_approval();

-- Allow admins to update profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
USING (has_role(auth.uid(), 'admin'));
