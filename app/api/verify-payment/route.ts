import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import { generateTalkingPhotoVideo } from '@/lib/heygen'

/**
 * Fallback payment verification — called by the result page when Stripe
 * redirects back with ?session_id=... but the webhook hasn't arrived yet
 * (e.g. stripe listen not running, webhook delay).
 *
 * Retrieves the session directly from Stripe, confirms payment, and
 * triggers full video generation if not already done.
 */
export async function POST(req: NextRequest) {
  try {
    const { session_id, job_id } = await req.json()

    if (!session_id || !job_id) {
      return NextResponse.json({ error: 'Missing session_id or job_id' }, { status: 400 })
    }

    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(session_id)

    // Verify this session belongs to this job
    if (session.metadata?.job_id !== job_id) {
      return NextResponse.json({ error: 'Session does not match job' }, { status: 403 })
    }

    // Only proceed if Stripe says payment is complete
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ paid: false })
    }

    const supabase = createServiceClient()

    // Fetch job
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', job_id)
      .single()

    if (error || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Already paid — just confirm so the client can proceed
    if (job.paid) {
      return NextResponse.json({ paid: true, already_processed: true })
    }

    // Mark as paid
    await supabase
      .from('jobs')
      .update({
        paid: true,
        paid_at: new Date().toISOString(),
        stripe_session_id: session.id,
      })
      .eq('id', job_id)

    // Trigger full video generation (fire and forget)
    void triggerFullVideo({ jobId: job_id, job, supabase })

    return NextResponse.json({ paid: true })
  } catch (err) {
    console.error('[verify-payment] Error', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}

async function triggerFullVideo({
  jobId,
  job,
  supabase,
}: {
  jobId: string
  job: Record<string, unknown>
  supabase: ReturnType<typeof import('@/lib/supabase-server').createServiceClient>
}) {
  try {
    if (!job.photo_url || !job.audio_url) {
      throw new Error('Missing photo_url or audio_url on job')
    }

    await supabase.from('jobs').update({ status: 'processing_full' }).eq('id', jobId)

    const fullVideoId = await generateTalkingPhotoVideo(
      job.photo_url as string,
      job.audio_url as string,
    )

    await supabase
      .from('jobs')
      .update({ heygen_full_video_id: fullVideoId })
      .eq('id', jobId)
  } catch (err) {
    console.error('[verify-payment] triggerFullVideo error', { jobId, err })
    await supabase
      .from('jobs')
      .update({
        status: 'failed',
        error_message: err instanceof Error ? err.message : 'Unknown error',
      })
      .eq('id', jobId)
  }
}
