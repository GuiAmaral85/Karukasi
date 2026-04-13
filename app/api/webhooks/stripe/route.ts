import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'
import { registerTalkingPhoto, generateTalkingPhotoVideo } from '@/lib/heygen'

// Tell Next.js to NOT parse the body — Stripe needs the raw bytes for signature verification
export const config = { api: { bodyParser: false } }

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ message: 'Missing stripe-signature header.' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('[webhook/stripe] Missing STRIPE_WEBHOOK_SECRET')
    return NextResponse.json({ message: 'Webhook secret not configured.' }, { status: 500 })
  }

  const stripe = getStripeClient()
  let event: ReturnType<typeof stripe.webhooks.constructEvent>

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('[webhook/stripe] Signature verification failed', err)
    return NextResponse.json({ message: 'Invalid webhook signature.' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object
  const jobId = session.metadata?.job_id

  if (!jobId) {
    console.error('[webhook/stripe] Missing job_id in session metadata', { sessionId: session.id })
    return NextResponse.json({ received: true })
  }

  const supabase = createServiceClient()

  const { data: job, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error || !job) {
    console.error('[webhook/stripe] Job not found', { jobId })
    return NextResponse.json({ received: true })
  }

  // Mark as paid
  await supabase
    .from('jobs')
    .update({
      paid: true,
      paid_at: new Date().toISOString(),
      stripe_session_id: session.id,
    })
    .eq('id', jobId)

  // Trigger full video generation in background
  void generateFullVideo({ jobId, job, supabase })

  return NextResponse.json({ received: true })
}

async function generateFullVideo({
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

    const talkingPhotoId = await registerTalkingPhoto(job.photo_url as string)
    const fullVideoId = await generateTalkingPhotoVideo(talkingPhotoId, job.audio_url as string)

    await supabase
      .from('jobs')
      .update({ heygen_full_video_id: fullVideoId })
      .eq('id', jobId)
  } catch (err) {
    console.error('[webhook/stripe] generateFullVideo error', { jobId, err })
    await supabase
      .from('jobs')
      .update({ status: 'failed', error_message: err instanceof Error ? err.message : 'Unknown error' })
      .eq('id', jobId)
  }
}
