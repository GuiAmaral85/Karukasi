/**
 * @jest-environment node
 */
import { GET } from '@/app/api/jobs/[id]/route'
import { NextRequest } from 'next/server'

const mockJob = {
  id: 'test-job-uuid',
  status: 'pending',
  heygen_preview_video_id: null,
  heygen_full_video_id: null,
  preview_url: null,
  full_video_url: null,
  elevenlabs_voice_id: null,
  audio_url: null,
  photo_url: null,
  paid: false,
  paid_at: null,
  stripe_session_id: null,
  email: null,
  error_message: null,
  created_at: '2026-04-12T00:00:00Z',
  updated_at: '2026-04-12T00:00:00Z',
}

const mockUpdate = jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) })

jest.mock('@/lib/supabase-server', () => ({
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: mockJob, error: null }),
        }),
      }),
      update: mockUpdate,
    })),
  })),
}))

jest.mock('@/lib/heygen', () => ({
  getVideoStatus: jest.fn().mockResolvedValue({ status: 'processing', video_url: null }),
}))

function makeRequest(id: string): NextRequest {
  return new NextRequest(new Request(`http://localhost/api/jobs/${id}`, { method: 'GET' }))
}

describe('GET /api/jobs/[id]', () => {
  it('returns 200 with job data', async () => {
    const res = await GET(makeRequest('test-job-uuid'), { params: Promise.resolve({ id: 'test-job-uuid' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('test-job-uuid')
    expect(body.status).toBe('pending')
  })

  it('returns 404 when job is not found', async () => {
    const { createServiceClient } = require('@/lib/supabase-server')
    createServiceClient.mockReturnValueOnce({
      from: jest.fn(() => ({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
        update: mockUpdate,
      })),
    })
    const res = await GET(makeRequest('nonexistent'), { params: Promise.resolve({ id: 'nonexistent' }) })
    expect(res.status).toBe(404)
  })
})
