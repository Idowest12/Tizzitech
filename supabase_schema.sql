-- Run this in your Supabase SQL Editor to configure the database schema correctly

-- 1. Create or replace products table
CREATE TABLE IF NOT EXISTS public.products (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  brand VARCHAR,
  category VARCHAR,
  price NUMERIC NOT NULL,
  condition VARCHAR,
  specs JSONB,
  description TEXT,
  stock INTEGER DEFAULT 0,
  "imageUrl" VARCHAR
);

CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'user',
  firstname VARCHAR,
  lastname VARCHAR,
  address VARCHAR,
  phone VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create or replace orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id VARCHAR PRIMARY KEY,
  user_id VARCHAR REFERENCES public.users(id) ON DELETE SET NULL,
  fullname VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  address TEXT NOT NULL,
  payment_option VARCHAR,
  total NUMERIC NOT NULL,
  status VARCHAR DEFAULT 'Confirmed',
  order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expected_delivery_date TIMESTAMP WITH TIME ZONE
);

-- 3. Create or replace order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id VARCHAR REFERENCES public.products(id) ON DELETE SET NULL,
  price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL
);

-- 4. Enable RLS and setup policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public read-only access to products" ON public.products;
    DROP POLICY IF EXISTS "Allow public insertion of orders" ON public.orders;
    DROP POLICY IF EXISTS "Allow public insertion of order items" ON public.order_items;
    DROP POLICY IF EXISTS "Allow public full access to users" ON public.users;
    DROP POLICY IF EXISTS "Allow public full access to orders" ON public.orders;
    DROP POLICY IF EXISTS "Allow public full access to order items" ON public.order_items;
END $$;

-- Anonymous users can read products
CREATE POLICY "Allow public read-only access to products" 
ON public.products FOR SELECT 
USING (true);

-- Allow full access to users (so auth works with anon key)
CREATE POLICY "Allow public full access to users" 
ON public.users FOR ALL 
USING (true) WITH CHECK (true);

-- Allow full access to orders
CREATE POLICY "Allow public full access to orders" 
ON public.orders FOR ALL 
USING (true) WITH CHECK (true);

-- Allow full access to order items
CREATE POLICY "Allow public full access to order items" 
ON public.order_items FOR ALL 
USING (true) WITH CHECK (true);

-- System backend (using SERVICE_ROLE key) bypasses all these policies anyway, so no extra admin policies needed!
