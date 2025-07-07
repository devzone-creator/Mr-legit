/*
  # Authentication and User Profiles Setup

  1. New Tables
    - Updates to profiles table to include location and contact details
    - Updates to orders table to include delivery and payment information
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add admin role policies
  
  3. Sample Data
    - Insert sample categories and products
    - Create admin user profile
*/

-- Update profiles table to include additional fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'address'
  ) THEN
    ALTER TABLE profiles ADD COLUMN address text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'city'
  ) THEN
    ALTER TABLE profiles ADD COLUMN city text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'region'
  ) THEN
    ALTER TABLE profiles ADD COLUMN region text;
  END IF;
END $$;

-- Update orders table to include additional fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE orders ADD COLUMN phone_number text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'delivery_notes'
  ) THEN
    ALTER TABLE orders ADD COLUMN delivery_notes text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'payment_method'
  ) THEN
    ALTER TABLE orders ADD COLUMN payment_method text;
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Products policies
CREATE POLICY "Anyone can read active products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage products"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Categories policies
CREATE POLICY "Anyone can read active categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Order items policies
CREATE POLICY "Users can read own order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for own orders"
  ON order_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can read all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert sample categories
INSERT INTO categories (name, description, is_active) VALUES
('Men''s Fashion', 'Premium clothing for modern men', true),
('iPhone Accessories', 'Premium iPhone cases, chargers, and accessories', true)
ON CONFLICT DO NOTHING;

-- Insert sample products
INSERT INTO products (
  name, description, price, original_price, category, brand, 
  image_url, colors, sizes, is_featured, is_new, discount, 
  rating, review_count
) VALUES
-- Men's Fashion
(
  'Premium Cotton Polo Shirt',
  'High-quality cotton polo shirt perfect for casual and semi-formal occasions. Breathable fabric with modern fit.',
  89.99, 120.00, 'mens-fashion', 'Mr. Legit',
  'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY['Navy Blue', 'White', 'Black', 'Grey'],
  ARRAY['S', 'M', 'L', 'XL', 'XXL'],
  true, false, 25, 4.5, 127
),
(
  'Classic Denim Jeans',
  'Premium denim jeans with perfect fit and durability. Made from high-quality cotton blend.',
  149.99, 199.99, 'mens-fashion', 'Mr. Legit',
  'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY['Dark Blue', 'Light Blue', 'Black'],
  ARRAY['28', '30', '32', '34', '36', '38'],
  true, true, 25, 4.7, 89
),
(
  'Casual Button-Up Shirt',
  'Versatile button-up shirt suitable for work and casual outings. Wrinkle-resistant fabric.',
  79.99, 99.99, 'mens-fashion', 'Mr. Legit',
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY['White', 'Light Blue', 'Pink', 'Grey'],
  ARRAY['S', 'M', 'L', 'XL'],
  false, true, 20, 4.3, 156
),
(
  'Premium Leather Belt',
  'Genuine leather belt with classic buckle. Perfect accessory for formal and casual wear.',
  59.99, 79.99, 'mens-fashion', 'Mr. Legit',
  'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY['Black', 'Brown', 'Tan'],
  ARRAY['32', '34', '36', '38', '40'],
  false, false, 25, 4.6, 203
),

-- iPhone Accessories
(
  'iPhone 15 Pro Max Case - Premium Leather',
  'Luxury leather case for iPhone 15 Pro Max. Provides excellent protection while maintaining elegant look.',
  45.99, 59.99, 'iphone-accessories', 'TechGuard',
  'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY['Black', 'Brown', 'Navy', 'Red'],
  ARRAY['iPhone 15 Pro Max'],
  true, true, 23, 4.8, 342
),
(
  'Wireless Charging Pad - Fast Charge',
  'High-speed wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED indicator.',
  39.99, 49.99, 'iphone-accessories', 'PowerTech',
  'https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY['Black', 'White'],
  ARRAY['Universal'],
  true, false, 20, 4.4, 178
),
(
  'Lightning to USB-C Cable - 2M',
  'Durable lightning to USB-C cable for fast charging and data transfer. Apple MFi certified.',
  25.99, 35.99, 'iphone-accessories', 'ConnectPro',
  'https://images.pexels.com/photos/4526462/pexels-photo-4526462.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY['White', 'Black'],
  ARRAY['2M'],
  false, true, 28, 4.2, 267
),
(
  'iPhone Screen Protector - Tempered Glass',
  'Premium tempered glass screen protector with 9H hardness. Easy installation with bubble-free application.',
  19.99, 29.99, 'iphone-accessories', 'ScreenShield',
  'https://images.pexels.com/photos/4526465/pexels-photo-4526465.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY['Clear'],
  ARRAY['iPhone 15', 'iPhone 15 Pro', 'iPhone 15 Pro Max', 'iPhone 14'],
  false, false, 33, 4.6, 445
),
(
  'Portable Power Bank - 20000mAh',
  'High-capacity power bank with fast charging support. Multiple ports for charging multiple devices.',
  69.99, 89.99, 'iphone-accessories', 'PowerMax',
  'https://images.pexels.com/photos/4526463/pexels-photo-4526463.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY['Black', 'White', 'Blue'],
  ARRAY['20000mAh'],
  true, false, 22, 4.7, 198
),
(
  'Car Phone Mount - Magnetic',
  'Strong magnetic car mount for safe hands-free phone use while driving. 360-degree rotation.',
  29.99, 39.99, 'iphone-accessories', 'DriveSecure',
  'https://images.pexels.com/photos/4526461/pexels-photo-4526461.jpeg?auto=compress&cs=tinysrgb&w=400',
  ARRAY['Black', 'Silver'],
  ARRAY['Universal'],
  false, true, 25, 4.3, 156
)
ON CONFLICT DO NOTHING;