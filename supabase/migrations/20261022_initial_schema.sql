-- ==============================================================================
-- LOKI ZONE — PHASE 2.3: INITIAL DATABASE SCHEMA & STORED PROCEDURES
-- ==============================================================================

-- 1. Sequences
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1;

-- 2. Products Table
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
  sales_count INT NOT NULL DEFAULT 0,
  weekly_velocity NUMERIC(10, 2) DEFAULT 0,
  specs JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  orders_count INT NOT NULL DEFAULT 0,
  total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0,
  is_demo BOOLEAN NOT NULL DEFAULT FALSE,
  joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
  code TEXT PRIMARY KEY,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10, 2) NOT NULL CHECK (discount_value > 0),
  min_spend NUMERIC(10, 2) NOT NULL DEFAULT 0,
  max_discount_amount NUMERIC(10, 2),
  usage_limit INT,
  usage_count INT NOT NULL DEFAULT 0,
  per_customer_limit INT DEFAULT 1,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
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

-- 6. Order Line Items Table
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

-- 7. Inventory Audit Log Table
CREATE TABLE IF NOT EXISTS public.inventory_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id TEXT REFERENCES public.orders(id) ON DELETE SET NULL,
  change_type TEXT NOT NULL,
  delta INT NOT NULL,
  new_stock INT NOT NULL,
  performed_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Store Settings Table
CREATE TABLE IF NOT EXISTS public.store_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Hero Slides CMS Table
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

-- 10. Floating Pills CMS Table
CREATE TABLE IF NOT EXISTS public.floating_pills (
  id TEXT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  label TEXT NOT NULL,
  image TEXT NOT NULL,
  link TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 11. Wholesale Rate Sheet Table
CREATE TABLE IF NOT EXISTS public.rate_sheet_items (
  sku TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  retail_npr NUMERIC(10, 2) NOT NULL,
  tier1_9 NUMERIC(10, 2) NOT NULL,
  tier10_49 NUMERIC(10, 2) NOT NULL,
  tier50plus NUMERIC(10, 2) NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE
);

-- 12. Reviews CMS Table
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

-- 13. FAQs CMS Table
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('shipping', 'products', 'warranty', 'payment')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 14. CTA Banners CMS Table
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

-- 15. Staff Members Table
CREATE TABLE IF NOT EXISTS public.staff_members (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('main', 'normal')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR QUERY OPTIMIZATION
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_instock ON public.products(in_stock, sales_count DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_audit_product ON public.inventory_audit_log(product_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff_members(email);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
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

-- Public storefront read access (active items only)
CREATE POLICY "Public can view active products" ON public.products FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active hero slides" ON public.hero_slides FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active floating pills" ON public.floating_pills FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active faqs" ON public.faqs FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can view active cta banners" ON public.cta_banners FOR SELECT USING (active = TRUE);
CREATE POLICY "Public can view approved reviews" ON public.reviews FOR SELECT USING (is_approved = TRUE);
CREATE POLICY "Public can view general store settings" ON public.store_settings FOR SELECT USING (key = 'general');
CREATE POLICY "Public can view active coupons" ON public.coupons FOR SELECT USING (active = TRUE);

-- All mutations and access to sensitive tables (orders, customers, staff, audit, rate sheets)
-- are granted exclusively to service_role (invoked via server-side Server Actions).

-- ==============================================================================
-- STORED PROCEDURE 1: ATOMIC COD CHECKOUT
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_cod_checkout(
  p_idempotency_key TEXT,
  p_customer_name TEXT,
  p_phone TEXT,
  p_email TEXT,
  p_city TEXT,
  p_address TEXT,
  p_coupon_code TEXT,
  p_cart_items JSONB
) RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_product RECORD;
  v_coupon RECORD;
  v_settings RECORD;
  v_delivery_fee NUMERIC := 100;
  v_free_threshold NUMERIC := 3000;
  v_subtotal NUMERIC := 0;
  v_discount NUMERIC := 0;
  v_total NUMERIC := 0;
  v_order_id TEXT;
  v_items_count INT := 0;
  v_norm_phone TEXT;
  v_norm_city TEXT;
  v_customer_id TEXT;
  v_seen_products TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- 1. Idempotency Check
  IF p_idempotency_key IS NOT NULL AND trim(p_idempotency_key) <> '' THEN
    SELECT id, total INTO v_order_id, v_total FROM public.orders WHERE idempotency_key = trim(p_idempotency_key);
    IF FOUND THEN
      RETURN jsonb_build_object('success', true, 'order_id', v_order_id, 'total', v_total, 'duplicate', true);
    END IF;
  END IF;

  -- 2. Validate Customer Input
  v_norm_phone := regexp_replace(trim(p_phone), '[^0-9+]', '', 'g');
  IF length(v_norm_phone) < 10 THEN
    RAISE EXCEPTION 'Invalid phone number format: %', p_phone;
  END IF;

  v_norm_city := trim(p_city);
  IF length(v_norm_city) < 2 THEN
    RAISE EXCEPTION 'City is required';
  END IF;

  -- 3. Resolve Delivery Settings from Database
  SELECT 
    COALESCE((value->>'deliveryInsideValley')::numeric, 100) AS inside,
    COALESCE((value->>'deliveryOutsideValley')::numeric, 150) AS outside,
    COALESCE((value->>'freeShippingThreshold')::numeric, 3000) AS threshold
  INTO v_settings
  FROM public.store_settings WHERE key = 'general';

  IF FOUND THEN
    v_free_threshold := v_settings.threshold;
    IF lower(v_norm_city) IN ('kathmandu', 'lalitpur', 'bhaktapur') THEN
      v_delivery_fee := v_settings.inside;
    ELSE
      v_delivery_fee := v_settings.outside;
    END IF;
  ELSE
    IF lower(v_norm_city) IN ('kathmandu', 'lalitpur', 'bhaktapur') THEN
      v_delivery_fee := 100;
    ELSE
      v_delivery_fee := 150;
    END IF;
  END IF;

  -- 4. Validate Cart Integrity (Alphabetical sorting prevents deadlocks)
  FOR v_item IN 
    SELECT productId, quantity 
    FROM jsonb_to_recordset(p_cart_items) AS x(productId TEXT, quantity INT)
    ORDER BY productId ASC
  LOOP
    IF v_item.quantity IS NULL OR v_item.quantity < 1 OR v_item.quantity > 10 THEN
      RAISE EXCEPTION 'Invalid quantity % for item %. Must be 1-10.', v_item.quantity, v_item.productId;
    END IF;

    IF v_item.productId = ANY(v_seen_products) THEN
      RAISE EXCEPTION 'Duplicate product in cart: %. Consolidate item quantities.', v_item.productId;
    END IF;
    v_seen_products := array_append(v_seen_products, v_item.productId);

    -- Row-level exclusive lock
    SELECT * INTO v_product FROM public.products WHERE id = v_item.productId FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product % does not exist', v_item.productId;
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

  -- Check Free Shipping
  IF v_subtotal >= v_free_threshold THEN
    v_delivery_fee := 0;
  END IF;

  -- 5. Validate Coupon
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

    -- Per-customer limit check
    IF v_coupon.per_customer_limit IS NOT NULL THEN
      DECLARE
        v_cust_usage INT;
      BEGIN
        SELECT count(*) INTO v_cust_usage FROM public.orders 
        WHERE upper(applied_coupon_code) = upper(v_coupon.code)
          AND (phone = v_norm_phone OR (email IS NOT NULL AND email = trim(p_email)))
          AND order_status <> 'Cancelled';

        IF v_cust_usage >= v_coupon.per_customer_limit THEN
          RAISE EXCEPTION 'You have already used coupon "%" the maximum number of times allowed', p_coupon_code;
        END IF;
      END;
    END IF;

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

  v_total := v_subtotal - v_discount + v_delivery_fee;

  -- 6. Generate Collision-Free Order ID (LK-YYMM-00001)
  v_order_id := 'LK-' || to_char(NOW(), 'YYMM') || '-' || lpad(nextval('order_number_seq')::text, 5, '0');

  -- 7. Deduct Stock & Record Inventory Audit
  FOR v_item IN SELECT productId, quantity FROM jsonb_to_recordset(p_cart_items) AS x(productId TEXT, quantity INT)
  LOOP
    UPDATE public.products 
    SET 
      stock_count = stock_count - v_item.quantity,
      in_stock = (stock_count - v_item.quantity) > 0,
      sales_count = sales_count + v_item.quantity,
      updated_at = NOW()
    WHERE id = v_item.productId
    RETURNING stock_count INTO v_product.stock_count;

    INSERT INTO public.inventory_audit_log (product_id, order_id, change_type, delta, new_stock, performed_by)
    VALUES (v_item.productId, v_order_id, 'checkout_deduction', -v_item.quantity, v_product.stock_count, 'system_checkout');
  END LOOP;

  -- 8. Upsert Customer Record
  v_customer_id := 'CUST-' || substr(md5(v_norm_phone), 1, 8);
  INSERT INTO public.customers (id, name, email, phone, city, orders_count, total_spent, is_demo, joined_date)
  VALUES (v_customer_id, trim(p_customer_name), trim(p_email), v_norm_phone, v_norm_city, 1, v_total, FALSE, NOW())
  ON CONFLICT (id) DO UPDATE SET
    orders_count = customers.orders_count + 1,
    total_spent = customers.total_spent + EXCLUDED.total_spent,
    city = EXCLUDED.city,
    updated_at = NOW();

  -- 9. Insert Order Record (Strict COD, Pending Confirmation)
  INSERT INTO public.orders (
    id, customer_id, customer_name, phone, email, city, address,
    subtotal, delivery_fee, discount_amount, total,
    payment_method, payment_status, order_status, items_count,
    applied_coupon_code, is_demo, stock_restored, idempotency_key
  ) VALUES (
    v_order_id, v_customer_id, trim(p_customer_name), v_norm_phone, trim(p_email), v_norm_city, trim(p_address),
    v_subtotal, v_delivery_fee, v_discount, v_total,
    'Cash on Delivery', 'unpaid_cod', 'Pending Confirmation', v_items_count,
    p_coupon_code, FALSE, FALSE, p_idempotency_key
  );

  -- 10. Insert Line Items
  FOR v_item IN SELECT productId, quantity FROM jsonb_to_recordset(p_cart_items) AS x(productId TEXT, quantity INT)
  LOOP
    SELECT * INTO v_product FROM public.products WHERE id = v_item.productId;
    INSERT INTO public.order_items (order_id, product_id, name, price, quantity, image, subtotal)
    VALUES (v_order_id, v_product.id, v_product.name, v_product.price, v_item.quantity, v_product.image, v_product.price * v_item.quantity);
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
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- STORED PROCEDURE 2: SAFE SINGLE-RESTORATION ORDER CANCELLATION
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.cancel_order_and_restore_stock(
  p_order_id TEXT,
  p_admin_email TEXT,
  p_cancellation_reason TEXT
) RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_new_stock INT;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order % does not exist', p_order_id;
  END IF;

  IF v_order.order_status = 'Cancelled' THEN
    RAISE EXCEPTION 'Order % is already cancelled', p_order_id;
  END IF;

  IF v_order.order_status = 'Delivered' THEN
    RAISE EXCEPTION 'Delivered orders cannot be cancelled directly; please process a return', p_order_id;
  END IF;

  IF v_order.stock_restored THEN
    RAISE EXCEPTION 'Stock has already been restored for order %', p_order_id;
  END IF;

  UPDATE public.orders 
  SET 
    order_status = 'Cancelled',
    payment_status = 'cancelled',
    stock_restored = TRUE,
    courier_note = COALESCE(courier_note || ' | ', '') || 'Cancelled by ' || p_admin_email || ': ' || COALESCE(p_cancellation_reason, 'No reason provided'),
    updated_at = NOW()
  WHERE id = p_order_id;

  FOR v_item IN SELECT product_id, quantity FROM public.order_items WHERE order_id = p_order_id
  LOOP
    UPDATE public.products
    SET 
      stock_count = stock_count + v_item.quantity,
      in_stock = TRUE,
      sales_count = GREATEST(0, sales_count - v_item.quantity),
      updated_at = NOW()
    WHERE id = v_item.product_id
    RETURNING stock_count INTO v_new_stock;

    INSERT INTO public.inventory_audit_log (product_id, order_id, change_type, delta, new_stock, performed_by)
    VALUES (v_item.product_id, p_order_id, 'order_cancellation_restock', v_item.quantity, v_new_stock, p_admin_email);
  END LOOP;

  IF v_order.applied_coupon_code IS NOT NULL THEN
    UPDATE public.coupons 
    SET usage_count = GREATEST(0, usage_count - 1)
    WHERE upper(code) = upper(v_order.applied_coupon_code);
  END IF;

  RETURN jsonb_build_object('success', true, 'order_id', p_order_id, 'status', 'Cancelled', 'stock_restored', true);
END;
$$ LANGUAGE plpgsql;
