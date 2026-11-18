-- ==============================================================================
-- PHASE 2: CUSTOMER ADDRESS BOOK & EXTENDED PROFILE
-- Migration: 20261114_customer_addresses.sql
-- Description:
--   1. Adds phone_secondary column to public.customers
--   2. Creates public.customer_addresses table with indexes and RLS
--   3. Creates transaction-safe SECURITY DEFINER functions for default switching
--      and deletion/promotion protected with pg_advisory_xact_lock
--   4. Grants execute strictly to service_role (revoked from PUBLIC/anon/auth)
-- ==============================================================================

-- 1. Add optional phone_secondary to public.customers
-- All existing columns, primary keys, and foreign keys remain 100% untouched
ALTER TABLE public.customers 
  ADD COLUMN IF NOT EXISTS phone_secondary TEXT;

-- 2. Create customer_addresses Table (Idempotent)
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id   TEXT NOT NULL,
  label           TEXT NOT NULL DEFAULT 'Home',
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  city            TEXT NOT NULL,
  address         TEXT NOT NULL,
  notes           TEXT DEFAULT '',
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Performance Index on clerk_user_id
CREATE INDEX IF NOT EXISTS idx_customer_addresses_clerk 
ON public.customer_addresses(clerk_user_id);

-- 4. Partial Unique Index: Database Safeguard for Exactly One Default Address per Clerk User
CREATE UNIQUE INDEX IF NOT EXISTS idx_customer_addresses_single_default 
ON public.customer_addresses (clerk_user_id) 
WHERE is_default = TRUE;

-- 5. Row Level Security Configuration
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Defense-in-depth: Zero direct public access (all traffic routed via server service_role)
DROP POLICY IF EXISTS "No public direct access to addresses" ON public.customer_addresses;
CREATE POLICY "No public direct access to addresses" 
ON public.customer_addresses 
FOR ALL 
USING (FALSE);

-- 6. Hardened Stored Procedure: Transaction-Safe Default Address Switching
-- Fully qualified tables, hardened search_path, and per-user advisory transaction lock
CREATE OR REPLACE FUNCTION public.set_default_customer_address(
  p_clerk_user_id TEXT,
  p_address_id UUID
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  -- Concurrency Guard: Serialize default address mutations per Clerk user
  PERFORM pg_advisory_xact_lock(hashtext('loki_default_addr_' || p_clerk_user_id));

  -- Step 1: Unset any existing default address for this user
  UPDATE public.customer_addresses
  SET is_default = FALSE, updated_at = NOW()
  WHERE clerk_user_id = p_clerk_user_id AND is_default = TRUE;

  -- Step 2: Set target address as default, enforcing user ownership
  UPDATE public.customer_addresses
  SET is_default = TRUE, updated_at = NOW()
  WHERE id = p_address_id AND clerk_user_id = p_clerk_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Address not found or unauthorized';
  END IF;
END;
$$;

-- Revoke execute from public/untrusted roles; grant strictly to service_role
REVOKE EXECUTE ON FUNCTION public.set_default_customer_address(TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_default_customer_address(TEXT, UUID) TO service_role;

-- 7. Hardened Stored Procedure: Transaction-Safe Address Deletion & Default Promotion
CREATE OR REPLACE FUNCTION public.delete_customer_address(
  p_clerk_user_id TEXT,
  p_address_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_was_default BOOLEAN;
  v_promoted_id UUID := NULL;
BEGIN
  -- Concurrency Guard: Serialize default address mutations per Clerk user using same lock key
  PERFORM pg_advisory_xact_lock(hashtext('loki_default_addr_' || p_clerk_user_id));

  -- Step 1: Check ownership and whether address being deleted is default
  SELECT is_default INTO v_was_default
  FROM public.customer_addresses
  WHERE id = p_address_id AND clerk_user_id = p_clerk_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Address not found or unauthorized';
  END IF;

  -- Step 2: Delete target address
  DELETE FROM public.customer_addresses
  WHERE id = p_address_id AND clerk_user_id = p_clerk_user_id;

  -- Step 3: If deleted address was default, atomically promote newest remaining address
  IF v_was_default THEN
    UPDATE public.customer_addresses
    SET is_default = TRUE, updated_at = NOW()
    WHERE id = (
      SELECT id FROM public.customer_addresses
      WHERE clerk_user_id = p_clerk_user_id
      ORDER BY created_at DESC
      LIMIT 1
    )
    RETURNING id INTO v_promoted_id;
  END IF;

  RETURN jsonb_build_object(
    'deleted_id', p_address_id,
    'was_default', v_was_default,
    'promoted_id', v_promoted_id
  );
END;
$$;

-- Revoke execute from public/untrusted roles; grant strictly to service_role
REVOKE EXECUTE ON FUNCTION public.delete_customer_address(TEXT, UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_customer_address(TEXT, UUID) TO service_role;
