-- Insert accessories into products table with proper UUIDs
INSERT INTO public.products (name, description, price, category, image_url, in_stock, inventory_count) VALUES
('Accessory Option 1', 'Premium accessory for enhanced functionality and performance.', 12999, 'accessory', '/placeholder.svg', true, 50),
('Accessory Option 2', 'Advanced accessory with smart features and remote control capabilities.', 18999, 'accessory', '/placeholder.svg', true, 35),
('Accessory Option 3', 'Professional accessory for commercial use with enhanced durability.', 24999, 'accessory', '/placeholder.svg', true, 25),
('Accessory Option 4', 'Premium accessory bundle with advanced monitoring and analytics capabilities.', 35999, 'accessory', '/placeholder.svg', true, 15);