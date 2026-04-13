'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import PhotoUploadZone from './PhotoUploadZone'
import AudioUploadZone from './AudioUploadZone'
import VoiceSelector from './VoiceSelector'

type Section = 'photo' | 'voice' | 'text' | 'submit'

export default function CreationForm() {
  const router = useRouter()

  const [photo, setPhoto] = useState<File | null>(null)
  const [audio, setAudio] = useState<File | null>(null)
  const [voiceId, setVoiceId] = useState<string | null>(null)
  const [useAudioRef, setUseAudioRef] = useState<boolean | null>(null)
  const [text, setText] = useState('')
  const [additionalPrompt, setAdditionalPrompt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [reached, setReached] = useState<Set<Section>>(new Set(['photo']))

  const unlock = (section: Section) =>
    setReached(prev => new Set([...prev, section]))

  const handlePhotoSelect = (file: File) => {
    setPhoto(file)
    unlock('voice')
  }

  const handleUseAudioRef = (value: boolean) => {
    setUseAudioRef(value)
    // reset the other path
    if (value) { setVoiceId(null) } else { setAudio(null) }
  }

  const handleAudioSelect = (file: File | null) => {
    setAudio(file)
    if (file) unlock('text')
  }

  const handleVoiceReady = (vid: string) => {
    setVoiceId(vid)
    unlock('text')
  }

  const canSubmit = photo !== null && (audio !== null || voiceId !== null) && text.trim().length > 0

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!canSubmit || isSubmitting) return
    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('photo', photo!)
      if (audio) formData.append('audio', audio)
      if (voiceId) formData.append('voice_id', voiceId)
      formData.append('text', text)
      if (additionalPrompt) formData.append('prompt', additionalPrompt)

      const res = await fetch('/api/generate', { method: 'POST', body: formData })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Erro ao processar a solicitação.')
      }
      const { job_id } = await res.json()
      router.push(`/result/${job_id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Não foi possível iniciar o processamento.')
      setIsSubmitting(false)
    }
  }

  const sectionClass = (s: Section) => reached.has(s) ? 'section-visible' : 'section-hidden'

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: '1.5rem',
    fontWeight: 300,
    color: '#1A1A1A',
    margin: 0,
  }

  const btnBase: React.CSSProperties = {
    padding: '10px 20px',
    fontSize: '0.875rem',
    borderRadius: '2px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Section 1 — Photo */}
      <section
        className="space-y-3"
        style={{ animation: 'fade-in-up 0.5s ease-out 100ms both' }}
      >
        <h2 style={labelStyle}>A fotografia</h2>
        <PhotoUploadZone onFileSelect={handlePhotoSelect} />
      </section>

      {/* Section 2 — Voice */}
      <section className={`space-y-4 transition-all duration-500 ${sectionClass('voice')}`}>
        <h2 style={labelStyle}>A voz</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          {([
            { label: 'Tenho uma gravação', value: true },
            { label: 'Escolher uma voz', value: false },
          ] as const).map(({ label, value }) => (
            <button
              key={String(value)}
              type="button"
              onClick={() => handleUseAudioRef(value)}
              style={{
                ...btnBase,
                border: `1px solid ${useAudioRef === value ? '#C4A4A4' : 'rgba(26,26,26,0.15)'}`,
                background: useAudioRef === value ? 'rgba(196,164,164,0.1)' : 'transparent',
                color: useAudioRef === value ? '#1A1A1A' : 'rgba(26,26,26,0.5)',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {useAudioRef === true && <AudioUploadZone onFileSelect={handleAudioSelect} />}
        {useAudioRef === false && <VoiceSelector onChange={handleVoiceReady} />}
      </section>

      {/* Section 3 — Text */}
      <section className={`space-y-4 transition-all duration-500 ${sectionClass('text')}`}>
        <h2 style={labelStyle}>As palavras</h2>

        <div className="space-y-2">
          <textarea
            value={text}
            onChange={e => {
              setText(e.target.value)
              if (e.target.value.trim().length > 0) unlock('submit')
            }}
            maxLength={500}
            rows={6}
            placeholder="Escreva aqui o que será dito no vídeo..."
            style={{
              width: '100%', resize: 'none', borderRadius: '2px',
              border: '1px solid rgba(26,26,26,0.15)', background: 'transparent',
              padding: '12px 16px', fontSize: '0.875rem', color: '#1A1A1A',
              outline: 'none', fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ textAlign: 'right', fontSize: '0.75rem', color: 'rgba(26,26,26,0.3)', margin: 0 }}>
            {text.length}/500
          </p>
        </div>

        <div className="space-y-2">
          <p style={{ fontSize: '0.75rem', color: 'rgba(26,26,26,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
            Observações adicionais (opcional)
          </p>
          <textarea
            value={additionalPrompt}
            onChange={e => setAdditionalPrompt(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Ex: fale devagar, tom melancólico, voz suave..."
            style={{
              width: '100%', resize: 'none', borderRadius: '2px',
              border: '1px solid rgba(26,26,26,0.10)', background: 'transparent',
              padding: '12px 16px', fontSize: '0.875rem', color: 'rgba(26,26,26,0.7)',
              outline: 'none', fontFamily: 'var(--font-sans)',
              boxSizing: 'border-box',
            }}
          />
          <p style={{ textAlign: 'right', fontSize: '0.75rem', color: 'rgba(26,26,26,0.25)', margin: 0 }}>
            {additionalPrompt.length}/300
          </p>
        </div>
      </section>

      {/* Section 4 — Submit */}
      <section className={`space-y-4 pb-16 transition-all duration-500 ${sectionClass('submit')}`}>
        {submitError && (
          <p style={{ fontSize: '0.875rem', color: 'rgba(196,164,164,0.8)', textAlign: 'center', margin: 0 }} role="alert">
            {submitError}
          </p>
        )}
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          style={{
            width: '100%',
            border: '1px solid #C4A4A4',
            background: 'rgba(196,164,164,0.1)',
            padding: '16px',
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#1A1A1A',
            borderRadius: '2px',
            cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
            opacity: canSubmit && !isSubmitting ? 1 : 0.4,
            transition: 'all 0.3s',
          }}
        >
          {isSubmitting ? 'Preparando a memória...' : 'Criar o vídeo memorial'}
        </button>
      </section>
    </form>
  )
}
