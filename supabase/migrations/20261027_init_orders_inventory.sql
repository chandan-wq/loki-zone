-- ==============================================================================
-- LOKI ZONE — STAGE 1: PRODUCTION-READY ORDERS & INVENTORY MIGRATION
-- Migration File: supabase/migrations/20261027_init_orders_inventory.sql
-- 
-- SUMMARY:
-- 1. Extensions & Monotonic Sequence for Order Numbers (CT-YYMM-00001)
-- 2. Core Tables: products, customers, coupons, orders, order_items, inventory_audit_log
-- 3. CMS/Operational Tables: store_settings, hero_slides, floating_pills, rate_sheet_items,
--    reviews, faqs, cta_banners, staff_members
-- 4. High-Performance Query Indexes
-- 5. Row Level Security (RLS) - Principle of Least Privilege
-- 6. Stored Procedure: process_cod_checkout (Concurrency-Safe Idempotency, Deadlock-Free)
-- 7. Stored Procedure: cancel_order_and_restore_stock (Safe Restoration & Missing Product Handling)
-- 8. Hardened Security Definer Search Path & Role Execution Revocations
-- 9. Idempotent Seed Data for 9 Verified Products & Store Defaults (ON CONFLICT DO NOTHING)
-- ==============================================================================

-- 1. EXTENSIONS & SEQUENCES
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SEQUENCE IF NOT EXISTS public.order_number_seq START WITH 1 INCREMENT BY 1;

-- ==============================================================================
-- 2. CORE E-COMMERCE TABLES
-- ==============================================================================

-- Products Catalog Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  series TEXT NOT NULL DEFAULT 'PERFORMANCE SERIES',
  subtitle TEXT,
  brand TEXT NOT NULL DEFAULT 'LOKI',
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  original_price NUMERIC(10, 2) NOT NULL CHECK (original_price >= 0),
  discount_percent NUMERIC(5, 2) DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('Rackets', 'Apparel', 'Footwear', 'Accessories', 'Balls')),
  image TEXT NOT NULL,
  additional_images TEXT[] DEFAULT ARRAY[]::TEXT[],
  description TEXT,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  stock_count INT NOT NULL DEFAULT 0 CHECK (stock_count >= 0),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  sales_count INT NOT NULL DEFAULT 0 CHECK (sales_count >= 0),
  weekly_velocity NUMERIC(10, 2) DEFAULT 0,
  specs JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customers Registry Table
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  orders_count INT NOT NULL DEFAULT 0 CHECK (orders_count >= 0),
  total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total_spent >= 0),
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coupons & Promotional Discounts Table
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_spend NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (min_spend >= 0),
  max_discount_amount NUMERIC(10, 2),
  usage_limit INT CHECK (usage_limit IS NULL OR usage_limit > 0),
  usage_count INT NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  per_customer_limit INT DEFAULT 1 CHECK (per_customer_limit IS NULL OR per_customer_limit > 0),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Orders Table (Strict COD, Collision-Free CT Order ID)
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
  clerk_user_id TEXT,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 100 CHECK (delivery_fee >= 0),
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL DEFAULT 'Cash on Delivery' CHECK (payment_method = 'Cash on Delivery'),
  payment_status TEXT NOT NULL DEFAULT 'unpaid_cod' CHECK (payment_status IN ('unpaid_cod', 'collected', 'cancelled')),
  order_status TEXT NOT NULL DEFAULT 'Pending Confirmation' CHECK (order_status IN ('Pending Confirmation', 'Processing', 'Dispatched', 'Delivered', 'Cancelled')),
  courier_note TEXT,
  items_count INT NOT NULL DEFAULT 1 CHECK (items_count > 0),
  applied_coupon_code TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  stock_restored BOOLEAN NOT NULL DEFAULT FALSE,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Order Line Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  quantity INT NOT NULL CHECK (quantity > 0),
  image TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- Inventory Audit Trail Table (Immutable Log)
CREATE TABLE IF NOT EXISTS public.inventory_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL,
  delta INT NOT NULL,
  new_stock INT NOT NULL,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. CMS & STORE CONFIGURATION TABLES
-- ==============================================================================

-- Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hero Slides CMS Table
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id INT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  bg_image TEXT NOT NULL,
  eyebrow TEXT NOT NULL,
  title_line1 TEXT NOT NULL,
  title_line2 TEXT NOT NULL,
  gradient TEXT NOT NULL,
  description TEXT NOT NULL,
  cta_text TEXT NOT NULL,
  cta_link TEXT NOT NULL,
  featured_badge TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Floating Pills CMS Table
CREATE TABLE IF NOT EXISTS public.floating_pills (
  id TEXT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  image TEXT NOT NULL,
  link TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Wholesale Rate Sheet Table
CREATE TABLE IF NOT EXISTS public.rate_sheet_items (
  sku TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  retail_npr NUMERIC(10, 2) NOT NULL,
  tier1_9 NUMERIC(10, 2) NOT NULL,
  tier10_49 NUMERIC(10, 2) NOT NULL,
  tier50plus NUMERIC(10, 2) NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE
);

-- Verified Player Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES public.products(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  role_or_club TEXT NOT NULL,
  rating NUMERIC(2, 1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  equipment TEXT NOT NULL,
  comment TEXT NOT NULL,
  date TEXT NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE
);

-- FAQ CMS Table
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('shipping', 'products', 'warranty', 'payment')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Promotional CTA Banners Table
CREATE TABLE IF NOT EXISTS public.cta_banners (
  id TEXT PRIMARY KEY,
  eyebrow TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  primary_btn_text TEXT NOT NULL,
  primary_btn_link TEXT NOT NULL,
  secondary_btn_text TEXT NOT NULL,
  secondary_btn_link TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Administrative Staff Directory
CREATE TABLE IF NOT EXISTS public.staff_members (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('main', 'normal')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. PERFORMANCE & LOOKUP INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_instock ON public.products(in_stock, sales_count DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_clerk_user_id ON public.orders(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency_key ON public.orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_product ON public.inventory_audit_log(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_order ON public.inventory_audit_log(order_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff_members(email);
CREATE INDEX IF NOT EXISTS idx_customers_clerk ON public.customers(clerk_user_id);

-- ==============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.floating_pills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_sheet_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;

-- Drop prior public policies if re-running
DROP POLICY IF EXISTS "Public can view active products" ON public.products;
DROP POLICY IF EXISTS "Public can view active hero slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Public can view active floating pills" ON public.floating_pills;
DROP POLICY IF EXISTS "Public can view active faqs" ON public.faqs;
DROP POLICY IF EXISTS "Public can view active cta banners" ON public.cta_banners;
DROP POLICY IF EXISTS "Public can view approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Public can view general store settings" ON public.store_settings;
DROP POLICY IF EXISTS "Public can view active coupons" ON public.coupons;

-- Storefront Public Read Access (Active catalog & CMS items only)
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active hero slides" ON public.hero_slides FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active floating pills" ON public.floating_pills FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active faqs" ON public.faqs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active cta banners" ON public.cta_banners FOR SELECT USING (active = TRUE);
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Public can view general store settings" ON public.store_settings FOR SELECT USING (key = 'general');
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (active = TRUE);

-- Sensitive tables (orders, customers, order_items, inventory_audit_log, staff_members, rate_sheet_items)
-- have ZERO public policies; all operations require server-side service_role execution.

-- ==============================================================================
-- 6. STORED PROCEDURE 1: ATOMIC COD CHECKOUT
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_cod_checkout(
  p_idempotency_key TEXT,
  p_customer_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_city TEXT,
  p_address TEXT,
  p_coupon_code TEXT,
  p_cart_items JSONB,
  p_clerk_user_id TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_item RECORD;
  v_product RECORD;
  v_coupon RECORD;
  v_settings RECORD;
  v_base_delivery_fee NUMERIC := 100;
  v_delivery_fee NUMERIC := 100;
  v_free_threshold NUMERIC := 2000;
  v_subtotal NUMERIC := 0;
  v_discount NUMERIC := 0;
  v_net_subtotal NUMERIC := 0;
  v_total NUMERIC := 0;
  v_order_id TEXT;
  v_items_count INT := 0;
  v_norm_phone TEXT;
  v_norm_city TEXT;
  v_customer_id TEXT;
  v_seen_products TEXT[] := ARRAY[]::TEXT[];
  v_existing_phone TEXT;
  v_existing_clerk TEXT;
  v_new_stock INT;
  v_cust_usage INT;
BEGIN
  -- 1. Concurrency-Safe Idempotency via Advisory Transaction Lock
  IF p_idempotency_key IS NOT NULL AND trim(p_idempotency_key) <> '' THEN
    PERFORM pg_advisory_xact_lock(hashtext('loki_order_' || trim(p_idempotency_key)));

    SELECT id, total, phone, clerk_user_id
    INTO v_order_id, v_total, v_existing_phone, v_existing_clerk
    FROM public.orders 
    WHERE idempotency_key = trim(p_idempotency_key);

    IF FOUND THEN
      v_norm_phone := regexp_replace(trim(p_phone), '[^0-9+]', '', 'g');
      -- Customer identity check: must match phone or authenticated clerk ID
      IF (v_existing_phone <> v_norm_phone) AND 
         (p_clerk_user_id IS NULL OR v_existing_clerk IS NULL OR v_existing_clerk <> trim(p_clerk_user_id)) THEN
        RAISE EXCEPTION 'Idempotency key collision with different customer identity';
      END IF;

      RETURN jsonb_build_object(
        'success', true, 
        'order_id', v_order_id, 
        'total', v_total, 
        'duplicate', true
      );
    END IF;
  END IF;

  -- 2. Validate Customer Input
  v_norm_phone := regexp_replace(trim(p_phone), '[^0-9+]', '', 'g');
  IF length(v_norm_phone) < 10 THEN
    RAISE EXCEPTION 'Invalid phone number format: %', p_phone;
  END IF;

  v_norm_city := trim(p_city);
  IF length(v_norm_city) < 2 THEN
    RAISE EXCEPTION 'Delivery city is required';
  END IF;

  IF p_customer_name IS NULL OR length(trim(p_customer_name)) < 2 THEN
    RAISE EXCEPTION 'Customer name is required';
  END IF;

  IF p_address IS NULL OR length(trim(p_address)) < 3 THEN
    RAISE EXCEPTION 'Delivery address is required';
  END IF;

  -- 3. Resolve Delivery Rules (Preserve verified store constants)
  SELECT 
    COALESCE((value->>'deliveryInsideValley')::numeric, 100) AS inside,
    COALESCE((value->>'deliveryOutsideValley')::numeric, 250) AS outside,
    COALESCE((value->>'freeShippingThreshold')::numeric, 2000) AS threshold
  INTO v_settings
  FROM public.store_settings WHERE key = 'general';

  IF FOUND THEN
    v_free_threshold := v_settings.threshold;
    IF lower(v_norm_city) IN ('kathmandu', 'lalitpur', 'bhaktapur') THEN
      v_base_delivery_fee := v_settings.inside;
    ELSE
      v_base_delivery_fee := v_settings.outside;
    END IF;
  ELSE
    v_free_threshold := 2000;
    IF lower(v_norm_city) IN ('kathmandu', 'lalitpur', 'bhaktapur') THEN
      v_base_delivery_fee := 100;
    ELSE
      v_base_delivery_fee := 250;
    END IF;
  END IF;

  -- 4. Validate Cart Integrity (Alphabetical sorting guarantees deadlock-free locking)
  FOR v_item IN 
    SELECT COALESCE(x.product_id, x.productid, x."productId") AS productId, x.quantity 
    FROM jsonb_to_recordset(p_cart_items) AS x("productId" TEXT, product_id TEXT, productid TEXT, quantity INT)
    ORDER BY 1 ASC
  LOOP
    IF v_item.quantity IS NULL OR v_item.quantity < 1 OR v_item.quantity > 10 THEN
      RAISE EXCEPTION 'Invalid quantity % for item %. Must be 1-10.', v_item.quantity, v_item.productId;
    END IF;

    IF v_item.productId = ANY(v_seen_products) THEN
      RAISE EXCEPTION 'Duplicate product in cart: %. Consolidate item quantities.', v_item.productId;
    END IF;
    v_seen_products := array_append(v_seen_products, v_item.productId);

    -- Row-level exclusive lock on product row
    SELECT * INTO v_product FROM public.products WHERE id = v_item.productId FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % does not exist', v_item.productId;
    END IF;

    IF NOT v_product.is_active THEN
      RAISE EXCEPTION 'Product "%" is no longer available', v_product.name;
    END IF;

    IF NOT v_product.in_stock OR v_product.stock_count < v_item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for "%". Available: %, Requested: %',
        v_product.name, v_product.stock_count, v_item.quantity;
    END IF;

    v_subtotal := v_subtotal + (v_product.price * v_item.quantity);
    v_items_count := v_items_count + v_item.quantity;
  END LOOP;

  IF v_items_count = 0 THEN
    RAISE EXCEPTION 'Cart cannot be empty';
  END IF;

  -- 5. Validate Coupon & Enforce Usage Limits Transactionally
  IF p_coupon_code IS NOT NULL AND trim(p_coupon_code) <> '' THEN
    SELECT * INTO v_coupon FROM public.coupons 
    WHERE upper(code) = upper(trim(p_coupon_code)) FOR UPDATE;

    IF NOT FOUND OR NOT v_coupon.active THEN
      RAISE EXCEPTION 'Coupon code "%" is invalid or inactive', p_coupon_code;
    END IF;

    IF v_coupon.starts_at IS NOT NULL AND NOW() < v_coupon.starts_at THEN
      RAISE EXCEPTION 'Coupon "%" has not started yet', p_coupon_code;
    END IF;

    IF v_coupon.expires_at IS NOT NULL AND NOW() > v_coupon.expires_at THEN
      RAISE EXCEPTION 'Coupon "%" has expired', p_coupon_code;
    END IF;

    IF v_subtotal < v_coupon.min_spend THEN
      RAISE EXCEPTION 'Order subtotal NPR % is below minimum spend of NPR % for coupon %',
        v_subtotal, v_coupon.min_spend, p_coupon_code;
    END IF;

    IF v_coupon.usage_limit IS NOT NULL AND v_coupon.usage_count >= v_coupon.usage_limit THEN
      RAISE EXCEPTION 'Coupon "%" has reached its maximum total usage limit', p_coupon_code;
    END IF;

    -- Per-customer usage check (phone, email, or clerk user ID)
    IF v_coupon.per_customer_limit IS NOT NULL THEN
      SELECT count(*) INTO v_cust_usage FROM public.orders 
      WHERE upper(applied_coupon_code) = upper(v_coupon.code)
        AND (
          phone = v_norm_phone OR 
          (email IS NOT NULL AND email = trim(p_email)) OR
          (p_clerk_user_id IS NOT NULL AND clerk_user_id = trim(p_clerk_user_id))
        )
        AND order_status <> 'Cancelled';

      IF v_cust_usage >= v_coupon.per_customer_limit THEN
        RAISE EXCEPTION 'You have already used coupon "%" the maximum number of times allowed', p_coupon_code;
      END IF;
    END IF;

    -- Calculate Discount
    IF v_coupon.discount_type = 'percent' THEN
      v_discount := (v_subtotal * v_coupon.discount_value) / 100;
      IF v_coupon.max_discount_amount IS NOT NULL AND v_discount > v_coupon.max_discount_amount THEN
        v_discount := v_coupon.max_discount_amount;
      END IF;
    ELSE
      v_discount := LEAST(v_coupon.discount_value, v_subtotal);
    END IF;

    UPDATE public.coupons SET usage_count = usage_count + 1 WHERE code = v_coupon.code;
  END IF;

  -- 6. Calculate Qualifying Net Subtotal & Free Delivery Threshold
  v_net_subtotal := GREATEST(0, v_subtotal - v_discount);
  IF v_net_subtotal >= v_free_threshold THEN
    v_delivery_fee := 0;
  ELSE
    v_delivery_fee := v_base_delivery_fee;
  END IF;

  v_total := v_net_subtotal + v_delivery_fee;

  -- 7. Generate Collision-Free Sequential CT Order ID (CT-YYMM-00001)
  v_order_id := 'CT-' || to_char(NOW(), 'YYMM') || '-' || lpad(nextval('order_number_seq')::text, 5, '0');

  -- 8. Upsert Customer Record
  v_customer_id := 'CUST-' || substr(md5(v_norm_phone), 1, 8);
  INSERT INTO public.customers (
    id, clerk_user_id, name, email, phone, city, orders_count, total_spent, is_demo, joined_date
  ) VALUES (
    v_customer_id, 
    CASE WHEN p_clerk_user_id IS NOT NULL AND trim(p_clerk_user_id) <> '' THEN trim(p_clerk_user_id) ELSE NULL END,
    trim(p_customer_name), 
    CASE WHEN p_email IS NOT NULL AND trim(p_email) <> '' THEN trim(p_email) ELSE NULL END,
    v_norm_phone, 
    v_norm_city, 
    1, 
    v_total, 
    FALSE, 
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    clerk_user_id = COALESCE(customers.clerk_user_id, EXCLUDED.clerk_user_id),
    name = EXCLUDED.name,
    email = COALESCE(EXCLUDED.email, customers.email),
    city = EXCLUDED.city,
    orders_count = customers.orders_count + 1,
    total_spent = customers.total_spent + EXCLUDED.total_spent,
    updated_at = NOW();

  -- 9. Insert Master Order Record FIRST so Child Rows Reference Valid Order ID
  INSERT INTO public.orders (
    id, customer_id, clerk_user_id, customer_name, phone, email, city, address,
    subtotal, delivery_fee, discount_amount, total,
    payment_method, payment_status, order_status, items_count,
    applied_coupon_code, is_demo, stock_restored, idempotency_key
  ) VALUES (
    v_order_id, 
    v_customer_id, 
    CASE WHEN p_clerk_user_id IS NOT NULL AND trim(p_clerk_user_id) <> '' THEN trim(p_clerk_user_id) ELSE NULL END,
    trim(p_customer_name), 
    v_norm_phone, 
    CASE WHEN p_email IS NOT NULL AND trim(p_email) <> '' THEN trim(p_email) ELSE NULL END,
    v_norm_city, 
    trim(p_address),
    v_subtotal, 
    v_delivery_fee, 
    v_discount, 
    v_total,
    'Cash on Delivery', 
    'unpaid_cod', 
    'Pending Confirmation', 
    v_items_count,
    CASE WHEN p_coupon_code IS NOT NULL AND trim(p_coupon_code) <> '' THEN upper(trim(p_coupon_code)) ELSE NULL END,
    FALSE, 
    FALSE, 
    CASE WHEN p_idempotency_key IS NOT NULL AND trim(p_idempotency_key) <> '' THEN trim(p_idempotency_key) ELSE NULL END
  );

  -- 10. Deduct Stock Atomically, Record Inventory Audit, and Insert Order Items
  FOR v_item IN 
    SELECT COALESCE(x.product_id, x.productid, x."productId") AS productId, x.quantity 
    FROM jsonb_to_recordset(p_cart_items) AS x("productId" TEXT, product_id TEXT, productid TEXT, quantity INT)
  LOOP
    UPDATE public.products 
    SET 
      stock_count = stock_count - v_item.quantity,
      in_stock = (stock_count - v_item.quantity) > 0,
      sales_count = sales_count + v_item.quantity,
      updated_at = NOW()
    WHERE id = v_item.productId
    RETURNING stock_count INTO v_new_stock;

    INSERT INTO public.inventory_audit_log (product_id, order_id, change_type, delta, new_stock, performed_by)
    VALUES (v_item.productId, v_order_id, 'checkout_deduction', -v_item.quantity, v_new_stock, 'system_checkout');

    SELECT * INTO v_product FROM public.products WHERE id = v_item.productId;
    INSERT INTO public.order_items (order_id, product_id, name, price, quantity, image, subtotal)
    VALUES (
      v_order_id, 
      v_product.id, 
      v_product.name, 
      v_product.price, 
      v_item.quantity, 
      v_product.image, 
      v_product.price * v_item.quantity
    );
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'subtotal', v_subtotal,
    'delivery_fee', v_delivery_fee,
    'discount', v_discount,
    'total', v_total
  );
END;
$$;

-- Revoke public execution of checkout procedure, grant exclusively to service_role
REVOKE ALL ON FUNCTION public.process_cod_checkout(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_cod_checkout(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO service_role;

-- ==============================================================================
-- 7. STORED PROCEDURE 2: SAFE SINGLE-RESTORATION ORDER CANCELLATION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.cancel_order_and_restore_stock(
  p_order_id TEXT,
  p_admin_email TEXT,
  p_cancellation_reason TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_new_stock INT;
  v_prod_exists BOOLEAN;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % does not exist', p_order_id;
  END IF;

  IF v_order.order_status = 'Cancelled' THEN
    RAISE EXCEPTION 'Order % is already cancelled', p_order_id;
  END IF;

  IF v_order.order_status = 'Delivered' THEN
    RAISE EXCEPTION 'Delivered order % cannot be cancelled directly; please process a return', p_order_id;
  END IF;

  IF v_order.stock_restored THEN
    RAISE EXCEPTION 'Stock has already been restored for order %', p_order_id;
  END IF;

  -- Update Order Status
  UPDATE public.orders 
  SET 
    order_status = 'Cancelled',
    payment_status = 'cancelled',
    stock_restored = TRUE,
    courier_note = COALESCE(courier_note || ' | ', '') || 'Cancelled by ' || COALESCE(p_admin_email, 'admin') || ': ' || COALESCE(p_cancellation_reason, 'No reason provided'),
    updated_at = NOW()
  WHERE id = p_order_id;

  -- Restock Items with Deleted Product Protection
  FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id
  LOOP
    SELECT EXISTS (SELECT 1 FROM public.products WHERE id = v_item.product_id FOR UPDATE) INTO v_prod_exists;

    IF v_prod_exists THEN
      UPDATE public.products
      SET 
        stock_count = stock_count + v_item.quantity,
        in_stock = (stock_count + v_item.quantity) > 0,
        sales_count = GREATEST(0, sales_count - v_item.quantity),
        updated_at = NOW()
      WHERE id = v_item.product_id
      RETURNING stock_count INTO v_new_stock;

      INSERT INTO public.inventory_audit_log (product_id, order_id, change_type, delta, new_stock, performed_by)
      VALUES (v_item.product_id, p_order_id, 'order_cancellation_restock', v_item.quantity, v_new_stock, COALESCE(p_admin_email, 'admin'));
    ELSE
      -- Product was removed from active catalog; record skipped restock without crashing cancellation
      INSERT INTO public.inventory_audit_log (product_id, order_id, change_type, delta, new_stock, performed_by)
      VALUES (NULL, p_order_id, 'restock_skipped_missing_product', v_item.quantity, 0, COALESCE(p_admin_email, 'admin'));
    END IF;
  END LOOP;

  -- Decrement Coupon Usage if Applicable
  IF v_order.applied_coupon_code IS NOT NULL THEN
    UPDATE public.coupons 
    SET usage_count = GREATEST(0, usage_count - 1)
    WHERE upper(code) = upper(v_order.applied_coupon_code);
  END IF;

  RETURN jsonb_build_object(
    'success', true, 
    'order_id', p_order_id, 
    'status', 'Cancelled', 
    'stock_restored', true
  );
END;
$$;

-- Revoke public execution of cancellation procedure, grant exclusively to service_role
REVOKE ALL ON FUNCTION public.cancel_order_and_restore_stock(TEXT, TEXT, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order_and_restore_stock(TEXT, TEXT, TEXT) TO service_role;

-- ==============================================================================
-- 8. IDEMPOTENT SEED DATA: 9 VERIFIED PRODUCTS (ON CONFLICT DO NOTHING)
-- Note: Does NOT overwrite live inventory or sales counts on rerun.
-- ==============================================================================
INSERT INTO public.products (
  id, name, series, subtitle, brand, price, original_price, discount_percent,
  rating, reviews_count, category, image, description, in_stock, stock_count,
  tags, sales_count, weekly_velocity, specs, is_active
) VALUES
(
  'loki-dragon-10',
  'LOKI Dragon 10',
  'PERFORMANCE SERIES',
  'Control. Spin. Your Game.',
  'LOKI',
  2499.00,
  3200.00,
  22,
  5.0,
  124,
  'Rackets',
  '/images/product-1-light.png',
  'The LOKI Dragon 10 is crafted for players who want precision, spin and stability in every shot. With high-quality rubber and a responsive 5-ply wood blade, it delivers the ultimate balance of control and power.',
  TRUE,
  18,
  ARRAY['Best Seller', 'Pro Choice', 'ITTF Approved']::TEXT[],
  842,
  94,
  '{"bladeType": "5-Ply Wood", "rubber": "High-Grip Pimples-In", "handleStyle": ["FL (Flared)", "ST (Straight)", "AN (Anatomic)"], "weight": "~ 85g (approx.)", "playingStyle": "All-Round / Offensive", "control": 92, "spin": 88, "speed": 85, "durability": 94}'::JSONB,
  TRUE
),
(
  'loki-aeroflex-jersey',
  'LOKI Aeroflex Pro Jersey',
  'CHAMPIONSHIP APPAREL',
  'Breathable. Dynamic. Ultra-light.',
  'LOKI',
  1799.00,
  2200.00,
  18,
  4.9,
  86,
  'Apparel',
  '/images/thumb-tshirt.png',
  'Engineered with moisture-wicking QuickDry microfiber fabric, this ergonomic jersey keeps you cool under intense rallies. Official team cut with reinforced flatlock stitching.',
  TRUE,
  25,
  ARRAY['New Arrival', 'Moisture Wicking']::TEXT[],
  420,
  58,
  '{"playingStyle": "High Activity"}'::JSONB,
  TRUE
),
(
  'loki-court-swift-shoes',
  'LOKI Swift Court Shoes',
  'FOOTWEAR ELITE',
  'Anti-slip gum rubber sole for explosive footwork.',
  'LOKI',
  3499.00,
  4200.00,
  17,
  4.8,
  64,
  'Footwear',
  '/images/thumb-shoes.png',
  'Designed specifically for quick lateral table tennis movements. Features non-marking honeycomb gum sole, reinforced heel cup, and breathable mesh upper.',
  TRUE,
  12,
  ARRAY['High Grip', 'Impact Cushion']::TEXT[],
  295,
  41,
  '{}'::JSONB,
  TRUE
),
(
  'loki-pro-shorts',
  'LOKI Pro Performance Shorts',
  'MATCH WEAR',
  'Flexible movement with dual side pockets.',
  'LOKI',
  1199.00,
  1500.00,
  20,
  4.9,
  52,
  'Apparel',
  '/images/thumb-shorts.png',
  'Elastic waistband with inner drawcord. Lightweight 4-way stretch fabric for maximum agility during fast footwork drills.',
  TRUE,
  30,
  ARRAY['Stretch Fit', 'Official Match Gear']::TEXT[],
  310,
  36,
  '{}'::JSONB,
  TRUE
),
(
  'loki-3-star-balls',
  'LOKI 3-Star ITTF Competition Balls',
  'OFFICIAL MATCH BALLS',
  'Consistent bounce, true roundness, 40+ ABS.',
  'LOKI',
  299.00,
  380.00,
  21,
  5.0,
  210,
  'Balls',
  '/images/balls-product.png',
  'ITTF approved seamless white 40+ ABS plastic competition balls. Pack of 6. Perfectly balanced weight and spin response for club and tournament play.',
  TRUE,
  150,
  ARRAY['ITTF Approved', 'Pack of 6', 'Best Value']::TEXT[],
  1250,
  165,
  '{}'::JSONB,
  TRUE
),
(
  'loki-hardcase-pro',
  'LOKI Hard-Shell Racket Case',
  'PROTECTION GEAR',
  'Reinforced EVA armor with ball storage pocket.',
  'LOKI',
  499.00,
  650.00,
  23,
  4.9,
  77,
  'Accessories',
  '/images/case-product.png',
  'Shockproof water-resistant carbon matte finish case holds 1-2 rackets safely and includes elastic net pocket for extra balls and rubber cleaner.',
  TRUE,
  40,
  ARRAY['Water Resistant', 'EVA Shell']::TEXT[],
  380,
  47,
  '{}'::JSONB,
  TRUE
),
(
  'loki-sports-towel',
  'LOKI High-Absorbency Towel',
  'MATCH ESSENTIALS',
  '100% combed cotton, quick moisture absorption.',
  'LOKI',
  299.00,
  399.00,
  25,
  4.7,
  39,
  'Accessories',
  '/images/thumb-case.png',
  'Plush black sports towel with embroidered LOKI branding. Soft on skin and highly absorbent during intense table tennis tournaments.',
  TRUE,
  85,
  ARRAY['100% Cotton', 'Super Soft']::TEXT[],
  180,
  22,
  '{}'::JSONB,
  TRUE
),
(
  'loki-dragon-8',
  'LOKI Dragon 8 Pro',
  'PERFORMANCE SERIES',
  'High precision speed racket for intermediate attacking players.',
  'LOKI',
  2199.00,
  2800.00,
  21,
  4.8,
  94,
  'Rackets',
  '/images/pdp-main-racket.png',
  'Engineered with 7-layer hybrid construction for crisp offensive loop drives. Outstanding elasticity and feedback on every ball impact.',
  TRUE,
  14,
  ARRAY['Offensive', '7-Ply']::TEXT[],
  512,
  68,
  '{"bladeType": "7-Ply Hybrid Wood", "rubber": "High-Tension Sticky Rubber", "handleStyle": ["FL (Flared)", "ST (Straight)"], "weight": "~ 88g", "playingStyle": "Offensive Loop", "control": 85, "spin": 91, "speed": 89, "durability": 92}'::JSONB,
  TRUE
),
(
  'loki-rxton-3',
  'LOKI RXTON 3 Rubber',
  'HIGH‑TENSION RUBBERS',
  'ITTF certified tacky pimples‑in formulation delivering immense topspin arc.',
  'LOKI',
  1499.00,
  1850.00,
  19,
  0,
  0,
  'Accessories',
  '/images/rubber-macro.png',
  'Rubber sheet for high‑tension play.',
  FALSE,
  0,
  ARRAY['High‑Tension', 'Rubber']::TEXT[],
  0,
  0,
  '{"speed": 85}'::JSONB,
  TRUE
)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Coupons (Verified from useAdminStore defaults)
INSERT INTO public.coupons (code, discount_type, discount_value, min_spend, active, usage_count)
VALUES
  ('LOKI10', 'percent', 10, 1500, TRUE, 0),
  ('CHAMPION500', 'fixed', 500, 3000, TRUE, 0),
  ('FREESHIP', 'fixed', 150, 1000, FALSE, 0)
ON CONFLICT (code) DO NOTHING;

-- Seed Default Store Settings (Preserving verified business delivery rules)
INSERT INTO public.store_settings (key, value)
VALUES
(
  'general',
  '{
    "storeName": "LOKI ZONE NEPAL",
    "supportPhone": "+977 9841-000000",
    "supportEmail": "support@lokizone.com.np",
    "announcementText": "🚀 Free Nationwide Delivery on orders over NPR 2,000 | Official ITTF 2026 Collection Live",
    "deliveryInsideValley": 100,
    "deliveryOutsideValley": 250,
    "freeShippingThreshold": 2000,
    "vatRate": 0
  }'::JSONB
)
ON CONFLICT (key) DO NOTHING;
