'use client'

import { useRef, useEffect, useState } from 'react'

interface Props {
  previewUrl: string
  jobId: string
  onPaymentClick: () => void
  showPaywall?: boolean
  isCheckingOut?: boolean
}

export default function PreviewPlayer({
  previewUrl,
  onPaymentClick,
  showPaywall = false,
  isCheckingOut = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [timerPaused, setTimerPaused] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0) // 0–1 over 3s

  // Stop at 3 seconds
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const onTimeUpdate = () => {
      const p = Math.min(video.currentTime / 3, 1)
      setProgress(p)
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

  const handlePlay = () => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = 0
    setTimerPaused(false)
    setProgress(0)
    video.play().then(() => setPlaying(true)).catch(() => {})
  }

  const overlayVisible = showPaywall || timerPaused
  const showPlayButton = !playing && !overlayVisible

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
        alignItems: 'center',
      }}
      className="k-preview-grid"
    >
      {/* ── Video column ── */}
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-struct)' }}>
        <video
          ref={videoRef}
          data-testid="preview-video"
          src={previewUrl}
          playsInline
          style={{
            width: '100%',
            display: 'block',
            filter: 'saturate(0.7) contrast(0.95)',
            aspectRatio: '4 / 5',
            objectFit: 'cover',
          }}
        />

        {/* Progress bar at base */}
        {playing && !overlayVisible && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: 'var(--line)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: 'rgba(255,255,255,0.8)',
                transition: 'width 0.1s linear',
              }}
            />
          </div>
        )}

        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <span
            className="k-label"
            style={{
              fontSize: '9px',
              color: 'white',
              opacity: 0.4,
              letterSpacing: '0.15em',
            }}
          >
            prévia · karukasi
          </span>
        </div>

        {/* Play button */}
        {showPlayButton && (
          <div
            onClick={handlePlay}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              background: 'rgba(14,13,12,0.25)',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(240,235,225,0.90)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 16px rgba(0,0,0,0.18)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5 3L15 9L5 15V3Z" fill="var(--ink)" />
              </svg>
            </div>
          </div>
        )}

        {/* Paywall overlay */}
        {overlayVisible && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '32px 24px',
              gap: '20px',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              backgroundColor: 'rgba(20,20,15,0.28)',
              animation: 'fade-in 500ms ease forwards',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p
                className="k-display"
                style={{
                  fontSize: '22px',
                  color: '#f0ebe1',
                  margin: 0,
                }}
              >
                Este é apenas o início da memória.
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'rgba(240,235,225,0.65)',
                  margin: 0,
                }}
              >
                Receba o vídeo completo para guardar para sempre.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Panel column ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <p
            className="k-label"
            style={{ letterSpacing: '0.12em', marginBottom: '12px' }}
          >
            Prévia — 3 segundos
          </p>
          <h2
            className="k-display"
            style={{ fontSize: 'clamp(22px, 3vw, 30px)', marginBottom: '12px' }}
          >
            Vídeo completo
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--ink-soft)',
              lineHeight: 1.65,
              margin: 0,
            }}
          >
            Uma transação, um download, sem renovações.
          </p>
        </div>

        {/* Price line */}
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '4px',
            paddingTop: '4px',
            borderTop: '1px solid var(--line)',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: 'var(--ink-muted)',
            }}
          >
            R$
          </span>
          <span
            className="k-display"
            style={{ fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1 }}
          >
            79
          </span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onPaymentClick}
            disabled={isCheckingOut}
            className="k-btn-primary"
            style={{
              justifyContent: 'center',
              opacity: isCheckingOut ? 0.5 : 1,
            }}
          >
            {isCheckingOut ? 'Redirecionando…' : 'Ver o vídeo completo — R$79'}
          </button>

          {timerPaused && (
            <button
              onClick={handlePlay}
              className="k-btn-ghost"
              style={{ justifyContent: 'center' }}
            >
              Assistir novamente
            </button>
          )}
        </div>

        <p
          className="k-label"
          style={{
            letterSpacing: '0.10em',
            textTransform: 'none',
            color: 'var(--ink-muted)',
            fontSize: '10px',
          }}
        >
          Pagamento seguro processado via Stripe. O download é liberado
          imediatamente após a confirmação.
        </p>
      </div>
    </div>
  )
}
