const BASE_URL = 'https://api.heygen.com'

function getApiKey(): string {
  const key = process.env.HEYGEN_API_KEY
  if (!key) throw new Error('Missing HEYGEN_API_KEY')
  return key
}

function heygenHeaders() {
  return {
    'X-Api-Key': getApiKey(),
    'Content-Type': 'application/json',
  }
}

// Register a photo as a HeyGen Talking Photo and return the talking_photo_id.
// This must be called before generating a video.
export async function registerTalkingPhoto(photoUrl: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/v2/talking_photo`, {
    method: 'POST',
    headers: heygenHeaders(),
    body: JSON.stringify({ talking_photo_url: photoUrl }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    console.error('[heygen] registerTalkingPhoto failed', { status: res.status, body })
    throw new Error(`HeyGen registerTalkingPhoto failed: ${res.status}`)
  }

  const { data } = await res.json()
  return data.talking_photo_id as string
}

// Generate a Talking Photo video from a registered photo and an audio URL.
// Returns the HeyGen video_id (async — poll getVideoStatus to check completion).
export async function generateTalkingPhotoVideo(
  talkingPhotoId: string,
  audioUrl: string
): Promise<string> {
  const body = {
    video_inputs: [
      {
        character: {
          type: 'talking_photo',
          talking_photo_id: talkingPhotoId,
          talking_style: 'stable',
        },
        voice: {
          type: 'audio',
          audio_url: audioUrl,
        },
        background: {
          type: 'color',
          value: '#F7F4EF',
        },
      },
    ],
    dimension: { width: 480, height: 480 },
    aspect_ratio: '1:1',
  }

  const res = await fetch(`${BASE_URL}/v2/video/generate`, {
    method: 'POST',
    headers: heygenHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[heygen] generateTalkingPhotoVideo failed', { status: res.status, err })
    throw new Error(`HeyGen video generation failed: ${res.status}`)
  }

  const { data } = await res.json()
  return data.video_id as string
}

export interface VideoStatusResult {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  video_url: string | null
}

// Poll HeyGen for video processing status.
export async function getVideoStatus(videoId: string): Promise<VideoStatusResult> {
  const res = await fetch(
    `${BASE_URL}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`,
    {
      method: 'GET',
      headers: {
        'X-Api-Key': getApiKey(),
        'Content-Type': 'application/json',
      },
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('[heygen] getVideoStatus failed', { videoId, status: res.status, err })
    throw new Error(`HeyGen getVideoStatus failed: ${res.status}`)
  }

  const { data } = await res.json()
  return {
    status: data.status,
    video_url: data.video_url ?? null,
  }
}
