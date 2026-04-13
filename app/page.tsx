import CreationForm from '@/components/CreationForm'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#F7F4EF' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px 64px' }}>
        <header style={{ marginBottom: '64px', textAlign: 'center', animation: 'fade-in 0.6s ease-out forwards' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3rem',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: '#1A1A1A',
            margin: 0,
          }}>
            Karukasi
          </h1>
          <p style={{
            marginTop: '16px',
            fontFamily: 'var(--font-display)',
            fontSize: '1.25rem',
            fontWeight: 300,
            fontStyle: 'italic',
            color: 'rgba(26,26,26,0.5)',
            margin: '16px 0 0 0',
          }}>
            Memórias que permanecem
          </p>
          <div style={{
            margin: '32px auto 0',
            height: '1px',
            width: '48px',
            backgroundColor: 'rgba(196,164,164,0.4)',
          }} />
        </header>
        <CreationForm />
      </div>
    </main>
  )
}
