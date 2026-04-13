'use client'

interface Props { videoUrl: string }

export default function FullVideoPlayer({ videoUrl }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', animation: 'fade-in 0.8s ease-out forwards' }}>
      <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '2px', maxWidth: '448px', margin: '0 auto' }}>
        <video
          src={videoUrl}
          controls
          autoPlay
          playsInline
          data-testid="full-video"
          style={{ width: '100%', display: 'block' }}
        />
      </div>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <a
          href={videoUrl}
          download
          style={{
            display: 'inline-block', border: '1px solid rgba(26,26,26,0.2)',
            padding: '12px 32px', fontSize: '0.875rem', color: 'rgba(26,26,26,0.7)',
            borderRadius: '2px', textDecoration: 'none', transition: 'all 0.2s',
          }}
        >
          Baixar vídeo
        </a>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontStyle: 'italic', color: 'rgba(26,26,26,0.35)', margin: 0 }}>
          Guarde este vídeo com carinho.
        </p>
      </div>
    </div>
  )
}
