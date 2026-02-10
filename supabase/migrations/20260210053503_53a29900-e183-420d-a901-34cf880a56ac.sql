
-- Update handle_new_user to save date_of_birth, home_address, nationality
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Create profile
    INSERT INTO public.profiles (user_id, name, email, phone, date_of_birth, home_address, nationality)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        CASE WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
             THEN (NEW.raw_user_meta_data->>'date_of_birth')::date 
             ELSE NULL END,
        NEW.raw_user_meta_data->>'home_address',
        NEW.raw_user_meta_data->>'nationality'
    );
    
    -- Create customer record
    INSERT INTO public.customers (user_id)
    VALUES (NEW.id);
    
    -- Assign customer role by default
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer');
    
    RETURN NEW;
END;
$function$;
