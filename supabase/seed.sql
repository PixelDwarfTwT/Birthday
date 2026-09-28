-- Insert default site settings
INSERT INTO site_settings (key, value) VALUES
('public_theme', '"blue-dream"'),
('public_recipient_name', '"Fitri Ramadani Arif (Mba Pit)"'),
('public_birthday_date', '"Today"'),
('public_enable_guestbook', 'true');

-- Insert sample letter
INSERT INTO letters (title, author, body, published) VALUES
('Selamat Ulang Tahun!', 'Surat Contoh', 'Semoga hari istimewamu penuh kebahagiaan. Tetap jadi pribadi yang luar biasa!', true);

-- Insert sample voucher
INSERT INTO vouchers (title, description, expiry_text, published) VALUES
('Traktir Kopi', 'Berlaku untuk satu kopi di kafe favoritmu.', 'Berlaku selama 30 hari', true);
