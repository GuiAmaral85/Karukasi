import {
  generateTalkingPhotoVideo,
  getVideoStatus,
} from '@/lib/heygen'

global.fetch = jest.fn()
afterEach(() => jest.clearAllMocks())

describe('generateTalkingPhotoVideo', () => {
  it('calls HeyGen v3/videos and returns video_id', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { video_id: 'vid_xyz789' }, error: null }),
    })

    const id = await generateTalkingPhotoVideo('https://example.com/photo.jpg', 'https://example.com/audio.mp3')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v3/videos'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(id).toBe('vid_xyz789')
  })
})

describe('getVideoStatus', () => {
  it('returns status and video_url when completed', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          status: 'completed',
          video_url: 'https://files.heygen.com/video.mp4',
        },
        error: null,
      }),
    })

    const result = await getVideoStatus('vid_xyz789')
    expect(result.status).toBe('completed')
    expect(result.video_url).toBe('https://files.heygen.com/video.mp4')
  })

  it('returns processing status when not ready', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { status: 'processing', video_url: null }, error: null }),
    })

    const result = await getVideoStatus('vid_xyz789')
    expect(result.status).toBe('processing')
    expect(result.video_url).toBeNull()
  })
})
