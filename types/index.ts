export type JobStatus =
  | 'pending'
  | 'processing_preview'
  | 'preview_ready'
  | 'processing_full'
  | 'completed'
  | 'failed'

export interface Job {
  id: string
  status: JobStatus
  heygen_preview_video_id: string | null
  heygen_full_video_id: string | null
  preview_url: string | null
  full_video_url: string | null
  elevenlabs_voice_id: string | null
  audio_url: string | null
  photo_url: string | null
  paid: boolean
  paid_at: string | null
  stripe_session_id: string | null
  email: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export type VoiceGender = 'feminino' | 'masculino'
export type VoiceAge = 'jovem' | 'adulto' | 'idoso'

export interface VoicePreset {
  voice_id: string
  name: string
}

// ElevenLabs preset voice IDs
export const VOICE_PRESETS: Record<`${VoiceGender}_${VoiceAge}`, VoicePreset> = {
  feminino_jovem:   { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
  feminino_adulto:  { voice_id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella' },
  feminino_idoso:   { voice_id: 'ThT5KcBeYPX3keUtsaye', name: 'Dorothy' },
  masculino_jovem:  { voice_id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam' },
  masculino_adulto: { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
  masculino_idoso:  { voice_id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold' },
}
