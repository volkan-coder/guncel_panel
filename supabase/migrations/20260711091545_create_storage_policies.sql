/*
# Storage bucket policies for uploads

1. Security
- Allow anon + authenticated to upload, read, and delete files in the 'uploads' bucket
- The bucket is public so file URLs are accessible without auth
*/

DROP POLICY IF EXISTS "anon_upload_uploads" ON storage.objects;
CREATE POLICY "anon_upload_uploads" ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'uploads');

DROP POLICY IF EXISTS "anon_read_uploads" ON storage.objects;
CREATE POLICY "anon_read_uploads" ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'uploads');

DROP POLICY IF EXISTS "anon_delete_uploads" ON storage.objects;
CREATE POLICY "anon_delete_uploads" ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'uploads');