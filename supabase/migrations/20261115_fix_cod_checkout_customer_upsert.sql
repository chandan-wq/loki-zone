-- ==============================================================================
-- FIX: Mandatory Customer Login Checkout Customer Upsert
-- Migration: 20261115_fix_cod_checkout_customer_upsert.sql
-- Description:
--   Resolves unique constraint violation ("customers_clerk_user_id_key") during
--   authenticated COD checkout by:
--   1. Locking customer row by Clerk ID to prevent concurrent duplicate inserts.
--   2. Resolving existing customer primarily by authenticated clerk_user_id.
--   3. Falling back to phone lookup ONLY for unlinked legacy guest accounts (clerk_user_id IS NULL).
--   4. Strictly preventing account merging or cross-account linking.
--   5. Updating existing customer order metrics in-place without attempting conflicting insert.
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

  -- 8. Customer Resolution & Upsert (Auth-Aware, Concurrency-Safe, No-Duplicate)
  v_customer_id := NULL;

  -- 8a. Concurrency Guard: Serialize customer mutations per Clerk user
  IF p_clerk_user_id IS NOT NULL AND trim(p_clerk_user_id) <> '' THEN
    PERFORM pg_advisory_xact_lock(hashtext('loki_cust_' || trim(p_clerk_user_id)));

    -- Primary Lookup: Find existing customer by authenticated Clerk User ID
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE clerk_user_id = trim(p_clerk_user_id)
    LIMIT 1;
  END IF;

  -- 8b. Fallback Lookup: Check if phone matches an unlinked legacy guest account (clerk_user_id IS NULL)
  -- Strict Isolation: NEVER match or link if the phone belongs to another Clerk account
  IF v_customer_id IS NULL THEN
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE phone = v_norm_phone AND clerk_user_id IS NULL
    LIMIT 1;
  END IF;

  -- 8c. If customer exists: Update metrics & contact details safely without duplicate insertion
  IF v_customer_id IS NOT NULL THEN
    UPDATE public.customers
    SET
      clerk_user_id = COALESCE(customers.clerk_user_id, CASE WHEN p_clerk_user_id IS NOT NULL AND trim(p_clerk_user_id) <> '' THEN trim(p_clerk_user_id) ELSE NULL END),
      name = trim(p_customer_name),
      email = COALESCE(CASE WHEN p_email IS NOT NULL AND trim(p_email) <> '' THEN trim(p_email) ELSE NULL END, customers.email),
      city = v_norm_city,
      orders_count = customers.orders_count + 1,
      total_spent = customers.total_spent + v_total,
      updated_at = NOW()
    WHERE id = v_customer_id;
  ELSE
    -- 8d. Genuine new customer: Generate ID and Insert
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
  END IF;

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

-- Security Grants: Revoke from public/untrusted roles; grant strictly to service_role
REVOKE ALL ON FUNCTION public.process_cod_checkout(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_cod_checkout(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT) TO service_role;
