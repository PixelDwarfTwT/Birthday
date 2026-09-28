# Storage Setup

1. In Supabase Dashboard, go to Storage.
2. Create a new bucket named `gallery`.
3. Set the bucket to "Public".
4. Go to SQL Editor and run the following to set up RLS for storage (Optional if you just use the UI policies, but recommended):

```sql
-- Allow public to read published images
CREATE POLICY "Public can view published gallery objects"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'gallery' AND
    EXISTS (
        SELECT 1 FROM gallery_items
        WHERE gallery_items.storage_path = storage.objects.name
        AND gallery_items.published = true
    )
);

-- Allow admins to upload, update, delete
CREATE POLICY "Admins can manage gallery objects"
ON storage.objects FOR ALL
USING (bucket_id = 'gallery' AND is_admin());
```
