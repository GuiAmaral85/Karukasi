/**
 * @jest-environment node
 */
import { POST } from '@/app/api/generate/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase-server', () => ({
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { id: 'test-job-uuid' },
            error: null,
          }),
        }),
      }),
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    })),
  })),
}))

jest.mock('@/lib/supabase-storage', () => ({
  uploadFile: jest.fn().mockResolvedValue('https://storage.example.com/file.jpg'),
}))

jest.mock('@/lib/elevenlabs', () => ({
  generateSpeech: jest.fn().mockResolvedValue(Buffer.from('audio data')),
  cloneVoice: jest.fn().mockResolvedValue('cloned_voice_id'),
}))

jest.mock('@/lib/heygen', () => ({
  registerTalkingPhoto: jest.fn().mockResolvedValue('tp_photo_id'),
  generateTalkingPhotoVideo: jest.fn().mockResolvedValue('heygen_video_id'),
}))

function makeRequest(overrides: Record<string, string | Blob> = {}): NextRequest {
  const fd = new FormData()
  fd.append('photo', new Blob(['img'], { type: 'image/jpeg' }), 'photo.jpg')
  fd.append('voice_id', '21m00Tcm4TlvDq8ikWAM')
  fd.append('text', 'Olá, saudades eternas.')
  for (const [k, v] of Object.entries(overrides)) fd.append(k, v)
  return new NextRequest(new Request('http://localhost/api/generate', {
    method: 'POST',
    body: fd,
  }))
}

describe('POST /api/generate', () => {
  it('returns 200 with job_id on valid request', async () => {
    const res = await POST(makeRequest())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('job_id')
    expect(typeof body.job_id).toBe('string')
  })

  it('returns 400 when photo is missing', async () => {
    const fd = new FormData()
    fd.append('voice_id', '21m00Tcm4TlvDq8ikWAM')
    fd.append('text', 'Some text')
    const req = new NextRequest(new Request('http://localhost/api/generate', { method: 'POST', body: fd }))
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when text is missing', async () => {
    const fd = new FormData()
    fd.append('photo', new Blob(['img'], { type: 'image/jpeg' }), 'photo.jpg')
    fd.append('voice_id', '21m00Tcm4TlvDq8ikWAM')
    const req = new NextRequest(new Request('http://localhost/api/generate', { method: 'POST', body: fd }))
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('returns 400 when neither voice_id nor audio is provided', async () => {
    const fd = new FormData()
    fd.append('photo', new Blob(['img'], { type: 'image/jpeg' }), 'photo.jpg')
    fd.append('text', 'Some text')
    const req = new NextRequest(new Request('http://localhost/api/generate', { method: 'POST', body: fd }))
    const res = await POST(req)
    expect(res.status).toBe(400)
  })
})
