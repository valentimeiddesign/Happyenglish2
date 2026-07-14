import { supabase } from "./supabase";

/**
 * Shared public media bucket (public read, admin-only write).
 * Holds review screenshots (`defaults/`, `uploads/`) and product covers (`products/`).
 */
export const MEDIA_BUCKET = "testimonials";

/** Upload an image and return its public URL. Throws on failure. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    contentType: file.type || "image/png",
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
}
