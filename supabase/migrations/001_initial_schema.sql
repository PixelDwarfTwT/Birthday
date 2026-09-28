-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create admin_users table
CREATE TABLE admin_users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create letters table
CREATE TABLE letters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    body TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create gallery_items table
CREATE TABLE gallery_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    storage_path TEXT NOT NULL,
    caption TEXT,
    alt_text TEXT NOT NULL DEFAULT '',
    published BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create vouchers table
CREATE TABLE vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    expiry_text TEXT,
    published BOOLEAN NOT NULL DEFAULT false,
    is_used BOOLEAN NOT NULL DEFAULT false,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create site_settings table
CREATE TABLE site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create guestbook_entries table
CREATE TABLE guestbook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    display_name TEXT NOT NULL,
    message TEXT NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_letters_updated_at BEFORE UPDATE ON letters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vouchers_updated_at BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- admin_users: admins can read
CREATE POLICY "Admins can view admin_users" ON admin_users FOR SELECT USING (is_admin());

-- letters: everyone can read published, admins can do all
CREATE POLICY "Public can view published letters" ON letters FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage letters" ON letters FOR ALL USING (is_admin());

-- gallery_items: everyone can read published, admins can do all
CREATE POLICY "Public can view published gallery items" ON gallery_items FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage gallery items" ON gallery_items FOR ALL USING (is_admin());

-- vouchers: everyone can read published, admins can do all
CREATE POLICY "Public can view published vouchers" ON vouchers FOR SELECT USING (published = true);
CREATE POLICY "Admins can manage vouchers" ON vouchers FOR ALL USING (is_admin());

-- site_settings: everyone can read 'safe' settings, admins can do all
CREATE POLICY "Public can view public settings" ON site_settings FOR SELECT USING (key LIKE 'public_%');
CREATE POLICY "Admins can manage settings" ON site_settings FOR ALL USING (is_admin());

-- guestbook_entries: public can read approved and insert, admins can do all
CREATE POLICY "Public can view approved guestbook entries" ON guestbook_entries FOR SELECT USING (approved = true);
CREATE POLICY "Public can insert guestbook entries" ON guestbook_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage guestbook entries" ON guestbook_entries FOR ALL USING (is_admin());
