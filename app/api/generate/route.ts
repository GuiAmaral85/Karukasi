import { NextRequest, NextResponse } from 'next/server'
import { waitUntil } from '@vercel/functions'
import { createServiceClient } from '@/lib/supabase-server'
import { uploadFile } from '@/lib/supabase-storage'
import { generateSpeech, cloneVoice, deleteVoice } from '@/lib/elevenlabs'
import { generateTalkingPhotoVideo } from '@/lib/heygen'

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ message: 'Formato de requisição inválido.' }, { status: 400 })
  }

  const photoFile = formData.get('photo') as File | null
  const audioFile = formData.get('audio') as File | null
  const presetVoiceId = formData.get('voice_id') as string | null
  const text = (formData.get('text') as string | null)?.trim()
  const additionalPrompt = (formData.get('prompt') as string | null)?.trim() || undefined

  const consentDeceased = formData.get('consent_deceased') === 'true'
  const consentAi       = formData.get('consent_ai')       === 'true'
  const consentTerms    = formData.get('consent_terms')    === 'true'

  if (!consentDeceased || !consentAi || !consentTerms) {
    return NextResponse.json(
      { message: 'É necessário aceitar todos os termos para continuar.' },
      { status: 400 }
    )
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
  const ua = req.headers.get('user-agent') ?? 'unknown'

  if (!photoFile || photoFile.size === 0) {
    return NextResponse.json({ message: 'A foto é obrigatória.' }, { status: 400 })
  }
  if (!text) {
    return NextResponse.json({ message: 'O texto é obrigatório.' }, { status: 400 })
  }
  if (!audioFile && !presetVoiceId) {
    return NextResponse.json(
      { message: 'Forneça uma gravação de voz ou selecione uma voz.' },
      { status: 400 }
    )
  }

  const supabase = createServiceClient()

  const { data: jobRow, error: insertError } = await supabase
    .from('jobs')
    .insert({
      status:           'pending',
      consent_deceased: consentDeceased,
      consent_ai:       consentAi,
      consent_terms:    consentTerms,
      consent_at:       new Date().toISOString(),
      consent_ip:       ip,
      consent_ua:       ua,
      consent_version:  'v1.0',
    })
    .select('id')
    .single()

  if (insertError || !jobRow) {
    console.error('[generate] insert job failed', insertError)
    return NextResponse.json({ message: 'Erro ao iniciar o processamento.' }, { status: 500 })
  }

  const jobId = jobRow.id as string

  const updateJob = async (fields: Record<string, unknown>) => {
    const { error } = await supabase.from('jobs').update(fields).eq('id', jobId)
    if (error) console.error('[generate] updateJob error', { jobId, error })
  }

  waitUntil(runPipeline({ jobId, photoFile, audioFile, presetVoiceId, text, additionalPrompt, updateJob }))

  return NextResponse.json({ job_id: jobId })
}

// Approximate character limit for ~3 seconds of Portuguese TTS speech.
const PREVIEW_MAX_CHARS = 100

function truncateForPreview(text: string): string {
  if (text.length <= PREVIEW_MAX_CHARS) return text
  const slice = text.slice(0, PREVIEW_MAX_CHARS)
  const lastSpace = slice.lastIndexOf(' ')
  return lastSpace > 0 ? slice.slice(0, lastSpace) : slice
}

async function runPipeline({
  jobId, photoFile, audioFile, presetVoiceId, text, additionalPrompt, updateJob,
}: {
  jobId: string
  photoFile: File
  audioFile: File | null
  presetVoiceId: string | null
  text: string
  additionalPrompt?: string
  updateJob: (fields: Record<string, unknown>) => Promise<void>
}) {
  try {
    const photoBuffer = Buffer.from(await photoFile.arrayBuffer())
    const photoUrl = await uploadFile(`photos/${jobId}.jpg`, photoBuffer, photoFile.type || 'image/jpeg')
    await updateJob({ photo_url: photoUrl })

    let clonedVoiceId: string | null = null
    let voiceId: string
    if (audioFile && audioFile.size > 0) {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
      clonedVoiceId = await cloneVoice(audioBuffer, audioFile.type || 'audio/mpeg')
      voiceId = clonedVoiceId
    } else {
      voiceId = presetVoiceId!
    }

    // Generate preview audio (truncated text ~3s) and full audio in sequence.
    // Delete the cloned voice after both succeed (or on any failure).
    let previewAudioBuffer: Buffer
    let fullAudioBuffer: Buffer
    try {
      previewAudioBuffer = await generateSpeech(voiceId, truncateForPreview(text))
      fullAudioBuffer    = await generateSpeech(voiceId, text, additionalPrompt)
    } finally {
      // Free the cloned voice slot immediately — never exhausts the limit.
      if (clonedVoiceId) await deleteVoice(clonedVoiceId)
    }

    // Upload preview audio (used only for the short HeyGen preview video).
    const previewAudioUrl = await uploadFile(`audio/${jobId}_preview.mp3`, previewAudioBuffer, 'audio/mpeg')

    // Upload full audio — stored for post-payment full video generation.
    const fullAudioUrl = await uploadFile(`audio/${jobId}.mp3`, fullAudioBuffer, 'audio/mpeg')
    await updateJob({ audio_url: fullAudioUrl, elevenlabs_voice_id: voiceId })

    // HeyGen preview uses the short audio — video will be ~3 seconds.
    const previewVideoId = await generateTalkingPhotoVideo(photoUrl, previewAudioUrl)
    await updateJob({ heygen_preview_video_id: previewVideoId, status: 'processing_preview' })
  } catch (err) {
    console.error('[generate] pipeline error', { jobId, err })
    await updateJob({
      status: 'failed',
      error_message: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
