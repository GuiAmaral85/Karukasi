import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getVideoStatus } from '@/lib/heygen'

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !job) {
    return NextResponse.json({ message: 'Trabalho não encontrado.' }, { status: 404 })
  }

  // Lazy HeyGen status check — update DB if video is now ready
  if (job.status === 'processing_preview' && job.heygen_preview_video_id) {
    try {
      const heygenStatus = await getVideoStatus(job.heygen_preview_video_id)
      if (heygenStatus.status === 'completed' && heygenStatus.video_url) {
        await supabase
          .from('jobs')
          .update({ status: 'preview_ready', preview_url: heygenStatus.video_url })
          .eq('id', id)
        job.status = 'preview_ready'
        job.preview_url = heygenStatus.video_url
      } else if (heygenStatus.status === 'failed') {
        await supabase
          .from('jobs')
          .update({ status: 'failed', error_message: 'HeyGen video generation failed.' })
          .eq('id', id)
        job.status = 'failed'
        job.error_message = 'HeyGen video generation failed.'
      }
    } catch (err) {
      console.error('[jobs/[id]] HeyGen preview status check error', { id, err })
    }
  }

  if (job.status === 'processing_full' && job.heygen_full_video_id) {
    try {
      const heygenStatus = await getVideoStatus(job.heygen_full_video_id)
      if (heygenStatus.status === 'completed' && heygenStatus.video_url) {
        await supabase
          .from('jobs')
          .update({ status: 'completed', full_video_url: heygenStatus.video_url })
          .eq('id', id)
        job.status = 'completed'
        job.full_video_url = heygenStatus.video_url

        // Send download email if job has an email address
        if (job.email) {
          const { sendDownloadEmail } = await import('@/lib/resend')
          void sendDownloadEmail(job.email as string, heygenStatus.video_url, id)
        }
      } else if (heygenStatus.status === 'failed') {
        await supabase
          .from('jobs')
          .update({ status: 'failed', error_message: 'HeyGen full video generation failed.' })
          .eq('id', id)
        job.status = 'failed'
        job.error_message = 'HeyGen full video generation failed.'
      }
    } catch (err) {
      console.error('[jobs/[id]] HeyGen full status check error', { id, err })
    }
  }

  return NextResponse.json(job)
}
