// ================================================================
//  NestVault — Storage helpers (image upload)
// ================================================================
import { sb, BUCKET, state } from '../config.js';

/**
 * Upload a File object to Supabase Storage.
 * Returns the public URL string.
 */
export async function uploadImage(file) {
  const ext  = file.name.split('.').pop().toLowerCase();
  const path = `${state.user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await sb.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl;
}
