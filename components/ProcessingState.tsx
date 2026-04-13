export default function ProcessingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '96px 0', gap: '24px' }}>
      <div style={{ position: 'relative', width: '64px', height: '64px' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(196,164,164,0.3)', animation: 'pulse-soft 2.5s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1px solid rgba(196,164,164,0.2)', animation: 'pulse-soft 2.5s ease-in-out infinite', animationDelay: '0.4s' }} />
        <div style={{ position: 'absolute', inset: '16px', borderRadius: '50%', background: 'rgba(196,164,164,0.1)', animation: 'pulse-soft 2.5s ease-in-out infinite', animationDelay: '0.8s' }} />
      </div>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'rgba(26,26,26,0.7)', fontStyle: 'italic', margin: 0 }}>
          Preparando a memória
        </p>
        <p style={{ fontSize: '0.875rem', color: 'rgba(26,26,26,0.35)', margin: 0 }}>
          Isso pode levar alguns instantes
        </p>
      </div>
    </div>
  )
}
