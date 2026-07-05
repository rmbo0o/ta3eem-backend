-- ============================================================
-- Migration: Food-specific → General Marketplace (سلة-like)
-- This script adds new tables and modifies existing ones
-- to transform the platform from a food-only marketplace
-- into a general multi-store marketplace.
-- ============================================================

-- 1. Add store-related columns to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS store_name VARCHAR(255) AFTER username,
  ADD COLUMN IF NOT EXISTS store_banner VARCHAR(500) AFTER logo,
  ADD COLUMN IF NOT EXISTS phone VARCHAR(50) AFTER email,
  ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50) AFTER phone,
  ADD COLUMN IF NOT EXISTS city VARCHAR(100) AFTER instagram,
  ADD COLUMN IF NOT EXISTS store_type VARCHAR(50) DEFAULT 'general' AFTER city;

-- 2. Create store_categories (general categories like Salla)
CREATE TABLE IF NOT EXISTS store_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(255),
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Insert general store categories
INSERT INTO store_categories (name, icon) VALUES
('إلكترونيات', 'fa-mobile-alt'),
('موضة', 'fa-tshirt'),
('الجمال والعناية', 'fa-spa'),
('الصحة', 'fa-heartbeat'),
('المنزل والمطبخ', 'fa-home'),
('الألعاب', 'fa-gamepad'),
('الكتب', 'fa-book'),
('الرياضة', 'fa-running'),
('السيارات', 'fa-car'),
('الهدايا', 'fa-gift'),
('الطعام والمشروبات', 'fa-utensils'),
('الحرف اليدوية', 'fa-hands'),
('الخدمات', 'fa-concierge-bell'),
('الأطفال', 'fa-baby');

-- 4. Create products table (replaces menus conceptually)
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  store_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  category_id INT,
  subcategory VARCHAR(100),
  sku VARCHAR(100),
  stock INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  has_discount TINYINT(1) DEFAULT 0,
  discount_price DECIMAL(10,2),
  social_media_link VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES store_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Migrate existing menu data to products table
INSERT INTO products (store_id, name, description, price, image_url, category_id, social_media_link, created_at)
SELECT 
  m.owner_id,
  m.food_name,
  m.description,
  m.price,
  m.image_url,
  (SELECT sc.id FROM store_categories sc WHERE sc.name = 'الطعام والمشروبات' LIMIT 1),
  m.social_media_link,
  m.created_at
FROM menus m;

-- 6. Create orders table (for future checkout functionality)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_phone VARCHAR(50),
  buyer_address TEXT,
  store_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Update existing categories table with general categories
INSERT INTO categories (name) VALUES
('إلكترونيات'),
('موضة'),
('الجمال والعناية'),
('الصحة'),
('المنزل والمطبخ'),
('الألعاب'),
('الكتب'),
('الرياضة'),
('السيارات'),
('الهدايا'),
('الحرف اليدوية'),
('الخدمات'),
('الأطفال')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 9. Add instagram field to users (already exists, just ensuring)
-- This field already exists: instagram VARCHAR(255)
