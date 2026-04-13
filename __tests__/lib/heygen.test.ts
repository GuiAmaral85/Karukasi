import {
  registerTalkingPhoto,
  generateTalkingPhotoVideo,
  getVideoStatus,
} from '@/lib/heygen'

global.fetch = jest.fn()
afterEach(() => jest.clearAllMocks())

describe('registerTalkingPhoto', () => {
  it('calls HeyGen v2/talking_photo and returns talking_photo_id', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { talking_photo_id: 'tp_abc123' }, error: null }),
    })

    const id = await registerTalkingPhoto('https://example.com/photo.jpg')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v2/talking_photo'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(id).toBe('tp_abc123')
  })

  it('throws on API error', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Invalid URL' } }),
    })
    await expect(registerTalkingPhoto('bad_url')).rejects.toThrow()
  })
})

describe('generateTalkingPhotoVideo', () => {
  it('calls HeyGen v2/video/generate and returns video_id', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { video_id: 'vid_xyz789' }, error: null }),
    })

    const id = await generateTalkingPhotoVideo('tp_abc123', 'https://example.com/audio.mp3')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v2/video/generate'),
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
