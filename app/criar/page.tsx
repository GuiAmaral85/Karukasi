import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import CreationForm from '@/components/CreationForm'

export const metadata = {
  title: 'Criar memorial — Karukasi',
  description: 'Envie a fotografia, a voz e as palavras. Nós cuidamos do resto.',
}

export default function CriarPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Flow header */}
      <header className="k-flow-header">
        <Link href="/" className="k-wordmark" style={{ fontSize: '1rem' }}>
          Karukasi
        </Link>

        {/* Step dots */}
        <div className="k-steps-dots">
          <span className="k-step-dot active" title="A memória" />
          <span className="k-step-dot" title="Prévia" />
          <span className="k-step-dot" title="Entrega" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <Link
            href="/"
            className="k-label"
            style={{
              color: 'var(--ink-muted)',
              textDecoration: 'none',
              letterSpacing: '0.12em',
              transition: 'color 200ms ease',
            }}
          >
            Fechar
          </Link>
        </div>
      </header>

      {/* Body */}
      <div className="k-flow-body">
        <div className="k-flow-form animate-fade-in">
          <header style={{ marginBottom: '48px', textAlign: 'center' }}>
            <h1
              className="k-display"
              style={{ fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: '12px' }}
            >
              Conte-nos sobre a memória.
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--ink-muted)',
                lineHeight: 1.65,
              }}
            >
              Preencha com calma. Nada é enviado até você decidir seguir.
            </p>
          </header>

          <CreationForm />
        </div>
      </div>
    </div>
  )
}
