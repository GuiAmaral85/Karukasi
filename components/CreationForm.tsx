'use client'

import { useState, useRef, FormEvent, DragEvent, ChangeEvent, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { VOICE_PRESETS, VoiceGender, VoiceAge } from '@/types'

/* ============================================================
   TYPES
   ============================================================ */

type VoiceMode = 'upload' | 'pills' | null

/* ============================================================
   MAIN FORM
   ============================================================ */

export default function CreationForm() {
  const router = useRouter()

  // Field state
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [audio, setAudio] = useState<File | null>(null)
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(null)
  const [gender, setGender] = useState<VoiceGender | null>(null)
  const [age, setAge] = useState<VoiceAge | null>(null)
  const [context, setContext] = useState('')

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // CTA is active when photo + text are filled
  const ctaEnabled = photo !== null && text.trim().length > 0

  // Derived: do we have a valid voice?
  const voiceReady = audio !== null || (gender !== null && age !== null)

  const handlePhotoSelect = useCallback((file: File) => {
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleAudioSelect = useCallback((file: File | null) => {
    setAudio(file)
    if (file) setVoiceMode('upload')
  }, [])

  const selectGender = (g: VoiceGender) => {
    setGender(g)
    setVoiceMode('pills')
    setAudio(null) // clear audio if they switch to pills
  }

  const selectAge = (a: VoiceAge) => {
    setAge(a)
    setVoiceMode('pills')
    setAudio(null)
  }

  const getVoiceId = (): string | null => {
    if (gender && age) {
      const key = `${gender}_${age}` as keyof typeof VOICE_PRESETS
      return VOICE_PRESETS[key]?.voice_id ?? null
    }
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!ctaEnabled || isSubmitting) return

    if (!voiceReady) {
      setSubmitError('Por favor, envie um áudio de referência ou selecione as características de voz.')
      return
    }

    setSubmitError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('photo', photo!)
      if (audio) formData.append('audio', audio)
      const voiceId = getVoiceId()
      if (voiceId) formData.append('voice_id', voiceId)
      formData.append('text', text)
      if (context.trim()) formData.append('prompt', context)

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

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* 1. PHOTO */}
      <FieldGroup label="Foto do ente querido" hint="Uma imagem com o rosto visível. JPG ou PNG, até 10 MB.">
        <PhotoDropZone
          preview={photoPreview}
          onFileSelect={handlePhotoSelect}
        />
      </FieldGroup>

      {/* 2. TEXT */}
      <FieldGroup
        label="O que você gostaria de ouvir"
        hint="Uma frase, um recado, uma despedida. Até 500 caracteres."
      >
        <div style={{ position: 'relative' }}>
          <textarea
            className="k-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={500}
            rows={6}
            placeholder="Escreva a mensagem que você gostaria de ouvir…"
          />
          <span
            className="k-char-counter"
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '12px',
              pointerEvents: 'none',
            }}
          >
            {text.length}/500
          </span>
        </div>
      </FieldGroup>

      {/* 3. VOICE */}
      <FieldGroup
        label="Referência de voz"
        hint="Se você tiver um áudio com a voz original, envie. Se não, escolha abaixo as características para aproximação."
      >
        <VoicePanels
          audio={audio}
          gender={gender}
          age={age}
          voiceMode={voiceMode}
          onAudioSelect={handleAudioSelect}
          onGenderSelect={selectGender}
          onAgeSelect={selectAge}
        />
      </FieldGroup>

      {/* 4. CONTEXT */}
      <FieldGroup
        label="Contexto adicional"
        hint="Instruções livres sobre tom, ritmo ou estilo da fala. Até 300 caracteres."
        optional
      >
        <div style={{ position: 'relative' }}>
          <textarea
            className="k-textarea"
            value={context}
            onChange={e => setContext(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Se houver algo que ajude — por exemplo, o jeito de falar, a cadência, a emoção…"
          />
          <span
            className="k-char-counter"
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '12px',
              pointerEvents: 'none',
            }}
          >
            {context.length}/300
          </span>
        </div>
      </FieldGroup>

      {/* ERROR */}
      {submitError && (
        <p
          role="alert"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--sand)',
            textAlign: 'center',
          }}
        >
          {submitError}
        </p>
      )}

      {/* CTA */}
      <div style={{ paddingBottom: '64px' }}>
        <p
          className="k-label"
          style={{
            textAlign: 'center',
            letterSpacing: '0.10em',
            textTransform: 'none',
            color: 'var(--ink-muted)',
            marginBottom: '16px',
            fontSize: '10px',
          }}
        >
          Os arquivos são removidos dos nossos servidores após a entrega.
        </p>
        <button
          type="submit"
          disabled={!ctaEnabled || isSubmitting}
          className="k-btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            opacity: ctaEnabled && !isSubmitting ? 1 : 0.4,
            transition: 'opacity 300ms ease, background 200ms ease, color 200ms ease',
          }}
        >
          {isSubmitting ? 'Preparando a prévia…' : 'Preparar a prévia'}
          {!isSubmitting && (
            <svg className="k-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2.5 11.5L11.5 2.5M11.5 2.5H4.5M11.5 2.5V9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </div>
    </form>
  )
}

/* ============================================================
   FIELD GROUP
   ============================================================ */

function FieldGroup({
  label,
  hint,
  optional = false,
  children,
}: {
  label: string
  hint?: string
  optional?: boolean
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <label
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--ink)',
          }}
        >
          {label}
        </label>
        {optional && (
          <span className="k-label" style={{ letterSpacing: '0.12em' }}>opcional</span>
        )}
      </div>
      {hint && (
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--ink-muted)',
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {hint}
        </p>
      )}
      {children}
    </div>
  )
}

/* ============================================================
   PHOTO DROP ZONE
   ============================================================ */

function PhotoDropZone({
  preview,
  onFileSelect,
}: {
  preview: string | null
  onFileSelect: (file: File) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = (file: File): string | null => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) return 'Use um arquivo JPG ou PNG.'
    if (file.size > 10 * 1024 * 1024) return 'A foto deve ter no máximo 10 MB.'
    return null
  }

  const handleFile = (file: File) => {
    const err = validate(file)
    if (err) { setError(err); return }
    setError(null)
    onFileSelect(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (preview) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          padding: '14px 16px',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-card)',
          background: 'var(--bg-inset)',
        }}
      >
        {/* Thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={preview}
          alt=""
          style={{
            width: '72px',
            height: '72px',
            objectFit: 'cover',
            borderRadius: '6px',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink)', margin: 0 }}>
            Foto carregada
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink-muted)', margin: '2px 0 0' }}>
            Clique em Trocar para substituir
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="k-btn-ghost"
          style={{ padding: '8px 14px', fontSize: '12px' }}
        >
          Trocar
        </button>
        <input
          ref={inputRef}
          data-testid="photo-input"
          type="file"
          accept="image/jpeg,image/png"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </div>
    )
  }

  return (
    <div>
      <div
        className={`k-drop-zone${isDragging ? ' drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      >
        {/* Upload icon */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          style={{ margin: '0 auto 12px', color: 'var(--ink-muted)', display: 'block' }}
          aria-hidden
        >
          <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <path d="M3 15l5-5 4 4 3-3 6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--ink)',
            marginBottom: '4px',
          }}
        >
          Envie ou arraste a foto
        </p>
        <p className="k-label" style={{ letterSpacing: '0.12em', textTransform: 'none' }}>
          JPG, PNG — até 10 MB
        </p>

        <input
          ref={inputRef}
          data-testid="photo-input"
          type="file"
          accept="image/jpeg,image/png"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </div>
      {error && (
        <p role="alert" style={{ fontSize: '12px', color: 'var(--sand)', marginTop: '8px' }}>
          {error}
        </p>
      )}
    </div>
  )
}

/* ============================================================
   VOICE PANELS (upload | or | pills)
   ============================================================ */

function VoicePanels({
  audio,
  gender,
  age,
  voiceMode,
  onAudioSelect,
  onGenderSelect,
  onAgeSelect,
}: {
  audio: File | null
  gender: VoiceGender | null
  age: VoiceAge | null
  voiceMode: VoiceMode
  onAudioSelect: (file: File | null) => void
  onGenderSelect: (g: VoiceGender) => void
  onAgeSelect: (a: VoiceAge) => void
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '0',
        alignItems: 'stretch',
      }}
    >
      {/* LEFT: audio upload */}
      <div style={{ flex: 1 }}>
        <AudioDropPanel
          audio={audio}
          active={voiceMode === 'upload'}
          onAudioSelect={onAudioSelect}
        />
      </div>

      {/* DIVIDER */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        <div className="k-voice-or">ou</div>
      </div>

      {/* RIGHT: pills */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '16px',
          border: `1.5px dashed ${voiceMode === 'pills' ? 'var(--ink)' : 'var(--line-strong)'}`,
          borderRadius: 'var(--r-card)',
          background: voiceMode === 'pills' ? 'var(--bg)' : 'var(--bg-inset)',
          transition: 'border-color 200ms ease, background 200ms ease',
        }}
      >
        <div>
          <p className="k-label" style={{ letterSpacing: '0.12em', marginBottom: '8px' }}>
            Gênero
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['feminino', 'masculino'] as VoiceGender[]).map(g => (
              <button
                key={g}
                type="button"
                className={`k-pill${gender === g ? ' selected' : ''}`}
                aria-pressed={gender === g}
                onClick={() => onGenderSelect(g)}
              >
                {g === 'feminino' ? 'Feminino' : 'Masculino'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="k-label" style={{ letterSpacing: '0.12em', marginBottom: '8px' }}>
            Faixa etária
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['jovem', 'adulto', 'idoso'] as VoiceAge[]).map(a => (
              <button
                key={a}
                type="button"
                className={`k-pill${age === a ? ' selected' : ''}`}
                aria-pressed={age === a}
                onClick={() => onAgeSelect(a)}
              >
                {a === 'jovem' ? 'Jovem' : a === 'adulto' ? 'Adulto' : 'Idoso'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   AUDIO DROP PANEL
   ============================================================ */

function AudioDropPanel({
  audio,
  active,
  onAudioSelect,
}: {
  audio: File | null
  active: boolean
  onAudioSelect: (file: File | null) => void
}) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = (file: File): boolean => {
    if (!['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav', 'audio/ogg', 'audio/mp4', 'video/mp4'].includes(file.type)) {
      setError('Use um arquivo MP3, WAV ou OGG.')
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('O arquivo de voz deve ter no máximo 5 MB.')
      return false
    }
    return true
  }

  const handleFile = (file: File) => {
    setError(null)
    if (!validate(file)) return
    onAudioSelect(file)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div
        style={{
          height: '100%',
          minHeight: '130px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px 12px',
          border: `1.5px dashed ${active ? 'var(--ink)' : isDragging ? 'var(--ink)' : 'var(--line-strong)'}`,
          borderRadius: 'var(--r-card)',
          background: active || isDragging ? 'var(--bg)' : 'var(--bg-inset)',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'border-color 200ms ease, background 200ms ease',
        }}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
      >
        {/* Mic icon */}
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--ink-muted)' }} aria-hidden>
          <rect x="7" y="1" width="6" height="10" rx="3" stroke="currentColor" strokeWidth="1.2" />
          <path d="M3 9a7 7 0 0 0 14 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <line x1="10" y1="16" x2="10" y2="19" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>

        {audio ? (
          <>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--ink)', margin: 0 }}>
              {audio.name.length > 20 ? audio.name.slice(0, 20) + '…' : audio.name}
            </p>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onAudioSelect(null) }}
              className="k-label"
              style={{ letterSpacing: '0.10em', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--ink-muted)' }}
            >
              Remover
            </button>
          </>
        ) : (
          <>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink)', margin: 0 }}>
              Enviar áudio de referência
            </p>
            <p className="k-label" style={{ letterSpacing: '0.10em', textTransform: 'none' }}>
              MP3, WAV — até 5 MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          data-testid="audio-input"
          type="file"
          accept="audio/mpeg,audio/wav,audio/mp3,audio/ogg"
          style={{ display: 'none' }}
          onChange={handleChange}
        />
      </div>
      {error && (
        <p role="alert" style={{ fontSize: '12px', color: 'var(--sand)', marginTop: '6px' }}>
          {error}
        </p>
      )}
    </div>
  )
}
