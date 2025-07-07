/*
  # Add Sample Data for Mr. Legit Store

  1. Sample Products
    - Men's fashion items with Ghana pricing
    - iPhone accessories
    - Featured and new products
  2. Sample Categories
    - Men's Fashion
    - iPhone Accessories
*/

-- Insert sample categories
INSERT INTO categories (name, description, is_active) VALUES
('Men''s Fashion', 'Premium clothing for modern men', true),
('iPhone Accessories', 'Premium iPhone cases, chargers, and accessories', true),
('Sale Items', 'Discounted items and special offers', true);

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
);