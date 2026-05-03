'use client'

import Link from 'next/link'

interface Props { videoUrl: string }

export default function FullVideoPlayer({ videoUrl }: Props) {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '32px',
        textAlign: 'center',
        padding: 'clamp(48px, 8vw, 72px) 0',
      }}
    >
      {/* Title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h2
          className="k-display"
          style={{ fontSize: 'clamp(22px, 3vw, 32px)' }}
        >
          Guarde este vídeo com carinho.
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            color: 'var(--ink-muted)',
            margin: 0,
          }}
        >
          O vídeo completo está pronto. O download foi enviado também para o seu e-mail.
        </p>
      </div>

      {/* Video */}
      <div
        style={{
          width: '100%',
          maxWidth: '320px',
          overflow: 'hidden',
          borderRadius: 'var(--r-struct)',
          border: '1px solid var(--line)',
        }}
      >
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          data-testid="full-video"
          style={{ width: '100%', display: 'block' }}
        />
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '320px' }}>
        <a
          href={videoUrl}
          download
          className="k-btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Baixar vídeo
          <svg className="k-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M7 2v8M3 7l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>

        <Link
          href="/"
          className="k-btn-ghost"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  )
}
