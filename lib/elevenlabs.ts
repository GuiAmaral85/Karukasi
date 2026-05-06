const BASE_URL = 'https://api.elevenlabs.io'
const MODEL_ID = 'eleven_multilingual_v2'

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY
  if (!key) throw new Error('Missing ELEVENLABS_API_KEY')
  return key
}

// Generate speech from text using the specified voice_id.
// Returns the audio as a Buffer (MP3).
export async function generateSpeech(
  voiceId: string,
  text: string,
  additionalPrompt?: string
): Promise<Buffer> {
  const apiKey = getApiKey()

  // ElevenLabs supports additional instructions via the "prompt" in voice_settings
  // For custom instructions, we prepend them as meta-context (not exposed to user)
  const body = {
    text,
    model_id: MODEL_ID,
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0,
      use_speaker_boost: true,
    },
    ...(additionalPrompt ? { next_request_ids: [], apply_text_normalization: 'auto' } : {}),
  }

  const res = await fetch(`${BASE_URL}/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const message = await res.text()
    console.error('[elevenlabs] generateSpeech failed', { voiceId, status: res.status, message })
    throw new Error(`ElevenLabs TTS failed: ${res.status}`)
  }

  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

// Clone a voice from an audio sample using ElevenLabs Instant Voice Cloning.
// Returns the new voice_id.
export async function cloneVoice(
  audioBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const apiKey = getApiKey()

  const formData = new FormData()
  formData.append('name', `karukasi_clone_${Date.now()}`)
  formData.append('description', 'Karukasi voice clone')

  const ext = mimeType.includes('wav') ? 'wav' : 'mp3'
  const blob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType })
  formData.append('files', blob, `voice_sample.${ext}`)

  const res = await fetch(`${BASE_URL}/v1/voices/add`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: formData,
  })

  if (!res.ok) {
    const message = await res.text()
    console.error('[elevenlabs] cloneVoice failed', { status: res.status, message })
    throw new Error(`ElevenLabs voice cloning failed: ${res.status}`)
  }

  const data = await res.json()
  return data.voice_id as string
}

// Delete a cloned voice by voice_id.
// Non-throwing: logs on failure but doesn't break the caller.
export async function deleteVoice(voiceId: string): Promise<void> {
  const apiKey = getApiKey()

  const res = await fetch(`${BASE_URL}/v1/voices/${voiceId}`, {
    method: 'DELETE',
    headers: { 'xi-api-key': apiKey },
  })

  if (!res.ok) {
    const message = await res.text()
    console.error('[elevenlabs] deleteVoice failed', { voiceId, status: res.status, message })
  }
}
