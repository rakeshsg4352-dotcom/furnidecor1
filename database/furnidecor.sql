-- =====================================================
-- FurniDecor Database Schema + Seed Data
-- Safe to re-run from scratch any time.
-- =====================================================

CREATE DATABASE IF NOT EXISTS furnidecor;
USE furnidecor;

-- Drop tables in reverse dependency order (children before parents)
-- so re-running this file never fails on foreign key constraints.
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS cart_items;
DROP TABLE IF EXISTS cart;
DROP TABLE IF EXISTS room_recommendations;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  role ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id INT,
  price DECIMAL(10,2) NOT NULL,
  discount_price DECIMAL(10,2),
  material VARCHAR(100),
  color VARCHAR(50),
  dimensions VARCHAR(100),
  stock_quantity INT NOT NULL DEFAULT 0,
  image_url VARCHAR(500),
  rating DECIMAL(2,1) DEFAULT 0,
  featured BOOLEAN DEFAULT FALSE,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_featured (featured)
);

-- =====================================================
-- ROOMS TABLE
-- =====================================================
CREATE TABLE rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ROOM_RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE room_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id INT NOT NULL,
  product_id INT NOT NULL,
  priority INT DEFAULT 0,
  FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_room (room_id)
);

-- =====================================================
-- CART TABLE
-- =====================================================
CREATE TABLE cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- CART_ITEMS TABLE
-- =====================================================
CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  FOREIGN KEY (cart_id) REFERENCES cart(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_cart (cart_id)
);

-- =====================================================
-- ORDERS TABLE
-- =====================================================
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  shipping_address TEXT NOT NULL,
  payment_method ENUM('COD', 'DEMO_ONLINE') NOT NULL DEFAULT 'COD',
  order_status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED')
    NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id),
  INDEX idx_status (order_status)
);

-- =====================================================
-- ORDER_ITEMS TABLE
-- =====================================================
CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  INDEX idx_order (order_id)
);

-- =====================================================
-- SEED DATA
-- =====================================================

-- ---------- CATEGORIES (15) ----------
INSERT INTO categories (name, description, image_url) VALUES
('Sofas', 'Comfortable seating for your living room', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc'),
('Beds', 'Premium beds for a restful sleep', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'),
('Dining Tables', 'Elegant tables for family meals', 'https://images.unsplash.com/photo-1617806118233-18e1de247200'),
('Chairs', 'Stylish chairs for every space', 'https://images.unsplash.com/photo-1503602642458-232111445657'),
('Wardrobes', 'Spacious storage for your clothing', 'https://images.unsplash.com/photo-1595428774223-ef52624120d2'),
('TV Units', 'Modern entertainment unit designs', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7'),
('Office Tables', 'Functional desks for productivity', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd'),
('Office Chairs', 'Ergonomic seating for work', 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8'),
('Bookshelves', 'Organize your books in style', 'https://images.unsplash.com/photo-1594620302200-9a762244a156'),
('Coffee Tables', 'Centerpiece tables for your lounge', 'https://images.unsplash.com/photo-1499933374294-4584851497cc'),
('Lighting', 'Illuminate your space beautifully', 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14'),
('Decoration', 'Accent pieces for personality', 'https://images.unsplash.com/photo-1487014679447-9f8336841d58'),
('Storage', 'Smart storage solutions', 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c'),
('Wall Decor', 'Mirrors, art, and wall accents', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38'),
('Outdoor Furniture', 'Furniture for balconies and gardens', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0');

-- ---------- ROOMS (6) ----------
INSERT INTO rooms (name, description, image_url) VALUES
('Living Room', 'Comfortable and stylish spaces to relax and entertain', 'https://images.unsplash.com/photo-1600210492493-0946911123ea'),
('Bedroom', 'Peaceful retreats designed for rest', 'https://images.unsplash.com/photo-1540518614846-7eded433c457'),
('Dining Room', 'Elegant spaces for shared meals', 'https://images.unsplash.com/photo-1617104551722-3b2d51366400'),
('Study Room', 'Focused spaces for learning and work', 'https://images.unsplash.com/photo-1521898284481-a5ec348cb555'),
('Home Office', 'Productive setups for remote work', 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6'),
('Corporate Office', 'Professional furniture for business spaces', 'https://images.unsplash.com/photo-1497366216548-37526070297c');

-- ---------- PRODUCTS (30) ----------
INSERT INTO products (name, description, category_id, price, discount_price, material, color, dimensions, stock_quantity, image_url, rating, featured, status) VALUES
('Modern 3-Seater Sofa', 'A plush, contemporary sofa perfect for family living rooms.', 1, 34999.00, 29999.00, 'Fabric', 'Grey', '210 x 90 x 85 cm', 12, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 4.5, TRUE, 'ACTIVE'),
('Luxury King Bed', 'Premium upholstered king-size bed frame with headboard.', 2, 45999.00, 39999.00, 'Wood & Fabric', 'Beige', '200 x 180 x 110 cm', 8, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', 4.7, TRUE, 'ACTIVE'),
('Solid Wood Dining Table', 'A sturdy 6-seater dining table crafted from solid sheesham wood.', 3, 27999.00, NULL, 'Sheesham Wood', 'Walnut', '180 x 90 x 76 cm', 10, 'https://images.unsplash.com/photo-1617806118233-18e1de247200', 4.6, TRUE, 'ACTIVE'),
('Ergonomic Office Chair', 'Adjustable mesh-back chair designed for long work hours.', 8, 8999.00, 6999.00, 'Mesh & Metal', 'Black', '65 x 65 x 115 cm', 25, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', 4.4, TRUE, 'ACTIVE'),
('Executive Office Desk', 'Spacious desk with drawers, ideal for home offices.', 7, 18999.00, 15999.00, 'Engineered Wood', 'Oak', '150 x 70 x 75 cm', 15, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd', 4.3, TRUE, 'ACTIVE'),
('Modern TV Unit', 'Sleek wall-mounted TV unit with storage cabinets.', 6, 15999.00, 12999.00, 'Engineered Wood', 'White', '160 x 40 x 45 cm', 14, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7', 4.2, TRUE, 'ACTIVE'),
('Oak Bookshelf', '5-tier bookshelf for organizing books and decor.', 9, 9999.00, NULL, 'Oak Wood', 'Brown', '80 x 30 x 180 cm', 18, 'https://images.unsplash.com/photo-1594620302200-9a762244a156', 4.1, FALSE, 'ACTIVE'),
('Minimal Coffee Table', 'Compact coffee table with a clean, modern look.', 10, 6999.00, 5499.00, 'Engineered Wood', 'Black', '100 x 55 x 45 cm', 20, 'https://images.unsplash.com/photo-1499933374294-4584851497cc', 4.3, TRUE, 'ACTIVE'),
('Fabric Lounge Chair', 'Cozy accent chair for reading corners.', 4, 11999.00, 9999.00, 'Fabric & Wood', 'Mustard', '75 x 80 x 90 cm', 16, 'https://images.unsplash.com/photo-1503602642458-232111445657', 4.5, FALSE, 'ACTIVE'),
('Wooden Wardrobe', '3-door wardrobe with ample hanging and shelf space.', 5, 32999.00, 27999.00, 'Engineered Wood', 'Walnut', '150 x 55 x 200 cm', 9, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2', 4.4, TRUE, 'ACTIVE'),
('Study Desk', 'Compact desk ideal for students and small rooms.', 7, 7999.00, 6499.00, 'Engineered Wood', 'White', '100 x 50 x 75 cm', 22, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd', 4.0, FALSE, 'ACTIVE'),
('Bedside Table', 'Compact nightstand with a drawer and open shelf.', 2, 3499.00, NULL, 'Engineered Wood', 'Oak', '45 x 40 x 55 cm', 30, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', 4.2, FALSE, 'ACTIVE'),
('Conference Table', 'Large table suited for corporate meeting rooms.', 3, 45999.00, 39999.00, 'Engineered Wood', 'Walnut', '240 x 100 x 75 cm', 6, 'https://images.unsplash.com/photo-1617806118233-18e1de247200', 4.6, FALSE, 'ACTIVE'),
('Reception Sofa', '2-seater sofa designed for office receptions.', 1, 19999.00, 16999.00, 'Leatherette', 'Black', '150 x 80 x 85 cm', 11, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 4.3, FALSE, 'ACTIVE'),
('Desk Lamp', 'Adjustable LED desk lamp with touch control.', 11, 1999.00, 1499.00, 'Metal', 'Black', '15 x 15 x 40 cm', 40, 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14', 4.1, FALSE, 'ACTIVE'),
('Decorative Floor Lamp', 'Elegant standing lamp for ambient lighting.', 11, 4999.00, NULL, 'Metal & Fabric', 'Gold', '35 x 35 x 150 cm', 17, 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14', 4.4, FALSE, 'ACTIVE'),
('Wall Mirror', 'Round decorative wall mirror with metal frame.', 14, 2999.00, 2499.00, 'Glass & Metal', 'Gold', '60 x 60 cm', 24, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38', 4.3, FALSE, 'ACTIVE'),
('Indoor Plant Stand', '3-tier wooden stand for indoor plants.', 12, 1799.00, NULL, 'Wood', 'Natural', '40 x 40 x 70 cm', 28, 'https://images.unsplash.com/photo-1487014679447-9f8336841d58', 4.2, FALSE, 'ACTIVE'),
('Dressing Table', 'Elegant dressing table with mirror and drawers.', 2, 13999.00, 11999.00, 'Engineered Wood', 'White', '100 x 45 x 140 cm', 10, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', 4.5, FALSE, 'ACTIVE'),
('Storage Cabinet', 'Multi-purpose storage cabinet with doors.', 13, 9999.00, 7999.00, 'Engineered Wood', 'Grey', '80 x 40 x 90 cm', 19, 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c', 4.1, FALSE, 'ACTIVE'),
('Workstation Desk', 'Modular workstation for corporate offices.', 7, 21999.00, 18999.00, 'Engineered Wood', 'Grey', '140 x 70 x 75 cm', 13, 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd', 4.3, FALSE, 'ACTIVE'),
('Executive Chair', 'High-back leather executive office chair.', 8, 14999.00, 12499.00, 'Leather', 'Brown', '70 x 70 x 120 cm', 12, 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8', 4.6, TRUE, 'ACTIVE'),
('2-Seater Sofa', 'Compact sofa ideal for small living rooms.', 1, 22999.00, 19999.00, 'Fabric', 'Blue', '150 x 85 x 85 cm', 14, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc', 4.2, FALSE, 'ACTIVE'),
('Recliner Chair', 'Single-seat recliner with footrest.', 4, 17999.00, 14999.00, 'Leatherette', 'Brown', '80 x 90 x 100 cm', 9, 'https://images.unsplash.com/photo-1503602642458-232111445657', 4.4, FALSE, 'ACTIVE'),
('Bunk Bed', 'Space-saving bunk bed for kids or guest rooms.', 2, 24999.00, 21999.00, 'Solid Wood', 'Natural', '200 x 100 x 160 cm', 7, 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85', 4.0, FALSE, 'ACTIVE'),
('Glass Coffee Table', 'Modern coffee table with tempered glass top.', 10, 8999.00, NULL, 'Glass & Metal', 'Black', '110 x 60 x 45 cm', 15, 'https://images.unsplash.com/photo-1499933374294-4584851497cc', 4.2, FALSE, 'ACTIVE'),
('Corner Wardrobe', 'Space-efficient wardrobe for corner spaces.', 5, 28999.00, 24999.00, 'Engineered Wood', 'White', '90 x 90 x 200 cm', 8, 'https://images.unsplash.com/photo-1595428774223-ef52624120d2', 4.3, FALSE, 'ACTIVE'),
('Bookshelf Cabinet', 'Combination bookshelf and cabinet unit.', 9, 12999.00, 10999.00, 'Engineered Wood', 'Walnut', '90 x 35 x 180 cm', 11, 'https://images.unsplash.com/photo-1594620302200-9a762244a156', 4.1, FALSE, 'ACTIVE'),
('Outdoor Patio Set', '4-piece outdoor seating set for balconies.', 15, 25999.00, 21999.00, 'Rattan', 'Brown', 'Varies', 6, 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0', 4.4, TRUE, 'ACTIVE'),
('Pendant Light', 'Modern hanging pendant light fixture.', 11, 3499.00, 2999.00, 'Metal & Glass', 'Black', '25 x 25 x 30 cm', 20, 'https://images.unsplash.com/photo-1524634126442-357e0eac3c14', 4.3, FALSE, 'ACTIVE'),
('Wall Art Set', 'Set of 3 framed abstract wall art pieces.', 14, 2499.00, NULL, 'Canvas & Wood', 'Multicolor', '30 x 40 cm each', 25, 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38', 4.2, FALSE, 'ACTIVE');

-- ---------- ROOM RECOMMENDATIONS ----------
INSERT INTO room_recommendations (room_id, product_id, priority) VALUES
(1, 1, 1), (1, 8, 2), (1, 6, 3), (1, 7, 4), (1, 16, 5), (1, 18, 6),
(2, 2, 1), (2, 10, 2), (2, 12, 3), (2, 19, 4), (2, 15, 5), (2, 17, 6),
(3, 3, 1), (3, 9, 2), (3, 30, 3), (3, 31, 4),
(4, 11, 1), (4, 4, 2), (4, 7, 3), (4, 15, 4),
(5, 5, 1), (5, 4, 2), (5, 7, 3), (5, 20, 4), (5, 15, 5),
(6, 21, 1), (6, 22, 2), (6, 13, 3), (6, 20, 4), (6, 14, 5);

-- ---------- ADMIN USER ----------
-- Password: Admin@123 (bcrypt hash below)
INSERT INTO users (name, email, password, phone, address, role) VALUES
('Admin User', 'admin@furnidecor.com', '$2a$10$8K1p/a0dURXAM7VjLLwx8OqoQdU8I0P9wJ8P.2P1KFhqUXVYXK4Wm', '9999999999', 'FurniDecor HQ', 'ADMIN');