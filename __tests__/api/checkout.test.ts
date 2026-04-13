/**
 * @jest-environment node
 */
import { POST } from '@/app/api/checkout/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/stripe', () => ({
  getStripeClient: jest.fn(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          url: 'https://checkout.stripe.com/pay/cs_test_abc123',
        }),
      },
    },
  })),
}))

jest.mock('@/lib/supabase-server', () => ({
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-job-uuid', status: 'preview_ready' },
            error: null,
          }),
        }),
      }),
    })),
  })),
}))

describe('POST /api/checkout', () => {
  it('returns Stripe checkout URL', async () => {
    const req = new NextRequest(new Request('http://localhost/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: 'test-job-uuid' }),
    }))
    const res = await POST(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.url).toContain('checkout.stripe.com')
  })

  it('returns 400 when job_id is missing', async () => {
    const req = new NextRequest(new Request('http://localhost/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }))
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
