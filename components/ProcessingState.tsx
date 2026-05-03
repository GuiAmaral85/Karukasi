'use client'

import { useState, useEffect } from 'react'

const PREVIEW_STEPS = [
  'Analisando a imagem',
  'Compondo a voz',
  'Animando o rosto',
  'Finalizando a prévia',
]

const FULL_STEPS = [
  'Renderizando o vídeo',
  'Ajustando qualidade',
  'Sincronizando áudio',
  'Quase pronto…',
]

interface Props {
  mode?: 'preview' | 'full'
  onRefresh?: () => void
}

export default function ProcessingState({ mode = 'preview', onRefresh }: Props) {
  const steps = mode === 'full' ? FULL_STEPS : PREVIEW_STEPS
  const [logIndex, setLogIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setLogIndex(prev => (prev + 1) % steps.length)
    }, 1100)
    return () => clearInterval(interval)
  }, [steps.length])

  // Track elapsed seconds for "taking longer than expected" message
  useEffect(() => {
    if (mode !== 'full') return
    const interval = setInterval(() => setElapsed(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [mode])

  const isLong = elapsed > 180 // > 3 min

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 14vw, 140px) 0',
        gap: '28px',
        textAlign: 'center',
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2 className="k-display" style={{ fontSize: 'clamp(22px, 3vw, 30px)' }}>
          {mode === 'full' ? 'Gerando o vídeo completo…' : 'Preparando a memória…'}
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-muted)', margin: 0 }}>
          {mode === 'full'
            ? 'Isso pode levar de 3 a 5 minutos. A página atualiza automaticamente.'
            : 'Levamos cerca de um minuto. Pode respirar.'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="k-progress-track" style={{ width: '240px' }}>
        <div className="k-progress-bar" />
      </div>

      {/* Rotating log */}
      <div
        key={logIndex}
        className="k-label animate-fade-in"
        style={{ letterSpacing: '0.15em', color: 'var(--ink-muted)', minHeight: '16px' }}
      >
        {steps[logIndex]}
      </div>

      {/* Manual refresh after 3 min */}
      {isLong && onRefresh && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--ink-muted)', margin: 0 }}>
            Está demorando mais que o normal.
          </p>
          <button onClick={onRefresh} className="k-btn-ghost" style={{ fontSize: '13px' }}>
            Verificar agora
          </button>
        </div>
      )}
    </div>
  )
}
