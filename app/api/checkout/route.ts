import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  let body: { job_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ message: 'Requisição inválida.' }, { status: 400 })
  }

  const { job_id } = body
  if (!job_id) {
    return NextResponse.json({ message: 'job_id é obrigatório.' }, { status: 400 })
  }

  // Verify job exists
  const supabase = createServiceClient()
  const { data: job, error } = await supabase
    .from('jobs')
    .select('id, status')
    .eq('id', job_id)
    .single()

  if (error || !job) {
    return NextResponse.json({ message: 'Trabalho não encontrado.' }, { status: 404 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const priceId = process.env.STRIPE_PRICE_ID

  if (!priceId) {
    console.error('[checkout] Missing STRIPE_PRICE_ID')
    return NextResponse.json({ message: 'Configuração de pagamento inválida.' }, { status: 500 })
  }

  const stripe = getStripeClient()
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { job_id },
    success_url: `${appUrl}/result/${job_id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/result/${job_id}`,
  })

  return NextResponse.json({ url: session.url })
}
