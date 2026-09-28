-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
('public_theme', '"blue-dream"'),
('public_recipient_name', '"Friend"'),
('public_birthday_date', '"Today"'),
('public_enable_guestbook', 'true');

-- Insert sample letter
INSERT INTO letters (title, author, body, published) VALUES
('Happy Birthday!', 'Surat Sample', 'Wishing you the best on your special day! Stay awesome.', true);

-- Insert sample voucher
INSERT INTO vouchers (title, description, expiry_text, published) VALUES
('Free Coffee', 'Valid for one free coffee at your favorite cafe.', 'Expires in 30 days', true);
