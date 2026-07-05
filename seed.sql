-- ============================================================
-- Seed: Demo stores and products for Souqy marketplace
-- Run this AFTER migration.sql if you want sample data
-- ============================================================

-- Demo stores (password for all: demo123456)
INSERT INTO users (username, store_name, email, password, city, store_type, bio, featured) VALUES
('tech_zone', 'تك زون - للإلكترونيات', 'tech@demo.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmO0JfR5Kq6qPqGzqFm', 'الرياض', 'إلكترونيات', 'متجر متخصص في أحدث الأجهزة الإلكترونية والهواتف', 1),
('fashion_house', 'دار الموضة', 'fashion@demo.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmO0JfR5Kq6qPqGzqFm', 'جدة', 'موضة', 'أحدث صيحات الموضة والعناية بالملابس', 1),
('beauty_garden', 'حديقة الجمال', 'beauty@demo.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmO0JfR5Kq6qPqGzqFm', 'الرياض', 'الجمال والعناية', 'منتجات عناية بالبشرة والشعر الأصلية', 1),
('home_plus', 'هوم بلس', 'home@demo.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmO0JfR5Kq6qPqGzqFm', 'الدمام', 'المنزل والمطبخ', 'أثاث منزلي وأدوات مطبخ عصرية', 0),
('sport_fit', 'سبورت آند فت', 'sport@demo.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmO0JfR5Kq6qPqGzqFm', 'الخبر', 'الرياضة', 'معدات رياضية وملابس تدريب', 0);
