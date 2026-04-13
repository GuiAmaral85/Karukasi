import type { Job, JobStatus } from '@/types'

describe('Job type', () => {
  it('accepts a valid job object', () => {
    const job: Job = {
      id: 'abc-123',
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
    expect(job.status).toBe('pending')
  })

  it('JobStatus covers all required statuses', () => {
    const statuses: JobStatus[] = [
      'pending',
      'processing_preview',
      'preview_ready',
      'processing_full',
      'completed',
      'failed',
    ]
    expect(statuses).toHaveLength(6)
  })
})
