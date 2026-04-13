import { generateSpeech, cloneVoice } from '@/lib/elevenlabs'

// Mock global fetch
global.fetch = jest.fn()

// Mock environment variable
beforeEach(() => {
  process.env.ELEVENLABS_API_KEY = 'test_key_123'
})

afterEach(() => {
  jest.clearAllMocks()
  delete process.env.ELEVENLABS_API_KEY
})

describe('generateSpeech', () => {
  it('calls ElevenLabs TTS endpoint with correct voice_id and text', async () => {
    const fakeAudio = Buffer.from('fake audio data')
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      arrayBuffer: async () => fakeAudio.buffer,
    })

    const result = await generateSpeech('21m00Tcm4TlvDq8ikWAM', 'Olá, saudades.')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(result).toBeInstanceOf(Buffer)
  })

  it('throws on non-ok response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      text: async () => 'Unauthorized',
    })

    await expect(generateSpeech('voice_id', 'text')).rejects.toThrow()
  })
})

describe('cloneVoice', () => {
  it('calls ElevenLabs voice cloning endpoint and returns a voice_id', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ voice_id: 'cloned_voice_abc123' }),
    })

    const buffer = Buffer.from('audio data')
    const voiceId = await cloneVoice(buffer, 'audio/mpeg')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/voices/add'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(voiceId).toBe('cloned_voice_abc123')
  })

  it('throws on non-ok response', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 422,
      text: async () => 'Unprocessable',
    })

    const buffer = Buffer.from('audio data')
    await expect(cloneVoice(buffer, 'audio/mpeg')).rejects.toThrow()
  })
})
