-- Fix security warnings: Set search_path on functions
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_account TEXT;
BEGIN
    LOOP
        new_account := LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.customers WHERE account_number = new_account);
    END LOOP;
    RETURN new_account;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_account_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.account_number IS NULL OR NEW.account_number = '' THEN
        NEW.account_number := public.generate_account_number();
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;