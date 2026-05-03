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

export interface VideoStatusResult {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  video_url: string | null
}

// Generate a Talking Photo video from a public photo URL and a public audio URL.
// Uses HeyGen v3 API — no pre-registration step needed.
// Returns the HeyGen video_id (async — poll getVideoStatus to check completion).
export async function generateTalkingPhotoVideo(
  photoUrl: string,
  audioUrl: string
): Promise<string> {
  const body = {
    type: 'image',
    image: {
      type: 'url',
      url: photoUrl,
    },
    audio_url: audioUrl,
    dimension: { width: 480, height: 480 },
  }

  const res = await fetch(`${BASE_URL}/v3/videos`, {
    method: 'POST',
    headers: heygenHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '')
    console.error(`[heygen] generateTalkingPhotoVideo failed status=${res.status} body=${bodyText}`)
    throw new Error(`HeyGen video generation failed: ${res.status} ${bodyText}`)
  }

  const { data } = await res.json()
  return data.video_id as string
}

// Poll HeyGen v3 for video processing status.
export async function getVideoStatus(videoId: string): Promise<VideoStatusResult> {
  const res = await fetch(`${BASE_URL}/v3/videos/${encodeURIComponent(videoId)}`, {
    method: 'GET',
    headers: {
      'X-Api-Key': getApiKey(),
    },
  })

  if (!res.ok) {
    const bodyText = await res.text().catch(() => '')
    console.error(`[heygen] getVideoStatus failed videoId=${videoId} status=${res.status} body=${bodyText}`)
    throw new Error(`HeyGen getVideoStatus failed: ${res.status}`)
  }

  const { data } = await res.json()
  return {
    status: data.status,
    video_url: data.video_url ?? null,
  }
}
