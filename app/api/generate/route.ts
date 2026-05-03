import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { uploadFile } from '@/lib/supabase-storage'
import { generateSpeech, cloneVoice } from '@/lib/elevenlabs'
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
    .insert({ status: 'pending' })
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

  void runPipeline({ jobId, photoFile, audioFile, presetVoiceId, text, additionalPrompt, updateJob })

  return NextResponse.json({ job_id: jobId })
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

    let voiceId: string
    if (audioFile && audioFile.size > 0) {
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer())
      voiceId = await cloneVoice(audioBuffer, audioFile.type || 'audio/mpeg')
    } else {
      voiceId = presetVoiceId!
    }

    const audioBuffer = await generateSpeech(voiceId, text, additionalPrompt)
    const audioUrl = await uploadFile(`audio/${jobId}.mp3`, audioBuffer, 'audio/mpeg')
    await updateJob({ audio_url: audioUrl, elevenlabs_voice_id: voiceId })

    const previewVideoId = await generateTalkingPhotoVideo(photoUrl, audioUrl)
    await updateJob({ heygen_preview_video_id: previewVideoId, status: 'processing_preview' })
  } catch (err) {
    console.error('[generate] pipeline error', { jobId, err })
    await updateJob({
      status: 'failed',
      error_message: err instanceof Error ? err.message : 'Unknown error',
    })
  }
}
