'use client'

import { useRef, useEffect, useState } from 'react'

interface Props {
  previewUrl: string
  jobId: string
  onPaymentClick: () => void
  showPaywall?: boolean
}

export default function PreviewPlayer({ previewUrl, onPaymentClick, showPaywall = false }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [timerPaused, setTimerPaused] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTimeUpdate = () => {
      if (video.currentTime >= 3) {
        video.pause()
        setTimerPaused(true)
      }
    }
    video.addEventListener('timeupdate', onTimeUpdate)
    return () => video.removeEventListener('timeupdate', onTimeUpdate)
  }, [])

  useEffect(() => {
    if (showPaywall || timerPaused) videoRef.current?.pause()
  }, [showPaywall, timerPaused])

  const overlayVisible = showPaywall || timerPaused

  return (
    <div style={{ position: 'relative', maxWidth: '448px', margin: '0 auto', animation: 'fade-in 0.8s ease-out forwards' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '2px' }}>
        <video
          ref={videoRef}
          data-testid="preview-video"
          src={previewUrl}
          autoPlay
          playsInline
          style={{ width: '100%', display: 'block' }}
        />

        {/* Watermark */}
        <div style={{ position: 'absolute', bottom: '12px', right: '12px', pointerEvents: 'none', userSelect: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', color: 'white', opacity: 0.25, letterSpacing: '0.05em' }}>
            karukasi.com
          </span>
        </div>

        {/* Paywall overlay */}
        {overlayVisible && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '32px', gap: '24px',
            backgroundColor: 'rgba(247,244,239,0.88)',
            animation: 'fade-in 0.5s ease-out forwards',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: '#1A1A1A', margin: 0 }}>
                Este é apenas o início da memória.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'rgba(26,26,26,0.55)', margin: 0 }}>
                Receba o vídeo completo para guardar para sempre.
              </p>
            </div>
            <button
              onClick={onPaymentClick}
              style={{
                width: '100%', maxWidth: '288px',
                border: '1px solid #C4A4A4', background: 'rgba(196,164,164,0.15)',
                padding: '14px 24px', fontSize: '0.875rem', fontWeight: 500,
                color: '#1A1A1A', borderRadius: '2px', cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              Ver o vídeo completo — R$79
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
