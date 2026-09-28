-- Keep gallery uploads limited to signed-in users registered as admins.
-- The SELECT policy is also required so Storage can return metadata for a new upload.

DROP POLICY IF EXISTS "Public can view published gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view gallery object metadata" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update gallery objects" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete gallery objects" ON storage.objects;

CREATE POLICY "Public can view published gallery objects"
ON storage.objects
FOR SELECT
TO public
USING (
    bucket_id = 'gallery'
    AND EXISTS (
        SELECT 1
        FROM public.gallery_items
        WHERE public.gallery_items.storage_path = storage.objects.name
          AND public.gallery_items.published = true
    )
);

CREATE POLICY "Admins can view gallery object metadata"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'gallery'
    AND public.is_admin()
);

CREATE POLICY "Admins can upload gallery objects"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'gallery'
    AND public.is_admin()
);

CREATE POLICY "Admins can update gallery objects"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'gallery'
    AND public.is_admin()
)
WITH CHECK (
    bucket_id = 'gallery'
    AND public.is_admin()
);

CREATE POLICY "Admins can delete gallery objects"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'gallery'
    AND public.is_admin()
);
