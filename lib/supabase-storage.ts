import { createServiceClient } from './supabase-server'

const BUCKET = 'karukasi'

// Upload a file buffer to Supabase Storage and return the public URL
export async function uploadFile(
  path: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const supabase = createServiceClient()

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, data, {
      contentType,
      upsert: true,
    })

  if (error) {
    console.error('[supabase-storage] upload error', { path, error })
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  return getPublicUrl(path)
}

// Get the public URL for a stored file (synchronous — no network call)
export function getPublicUrl(path: string): string {
  const supabase = createServiceClient()
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
