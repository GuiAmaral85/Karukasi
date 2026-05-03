import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

config({ path: resolve(process.cwd(), '.env.local') })

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

;(async () => {
  const { data } = await sb
    .from('jobs')
    .select('id, status, error_message, photo_url, audio_url, heygen_preview_video_id, paid, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  console.table(data?.map(j => ({
    id: j.id?.slice(0, 8),
    status: j.status,
    paid: j.paid,
    error: j.error_message?.slice(0, 60),
    photo: j.photo_url ? '✓' : '✗',
    audio: j.audio_url ? '✓' : '✗',
    heygen_id: j.heygen_preview_video_id?.slice(0, 12) || '-',
  })))
})()
