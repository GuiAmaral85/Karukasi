import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import FaqAccordion from '@/components/FaqAccordion'
import Reveal from '@/components/Reveal'

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <HowItWorks />
        <Pricing />
        <AboutName />
        <FaqSection />
      </main>
      <SiteFooter />
    </>
  )
}

/* ============================================================
   HEADER
   ============================================================ */

function SiteHeader() {
  return (
    <header className="k-header">
      <div className="k-container k-header-inner">
        <Link href="/" className="k-wordmark">
          Karukasi
        </Link>

        <nav className="k-header-nav" aria-label="Navegação principal">
          <a href="#how">Como funciona</a>
          <a href="#name">Sobre o nome</a>
          <a href="#faq">Perguntas</a>
        </nav>

        <div className="k-header-actions">
          <ThemeToggle />
          <Link href="/criar" className="k-btn-primary" style={{ padding: '10px 18px', fontSize: '13px' }}>
            Começar
            <svg className="k-arrow" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ============================================================
   HERO
   ============================================================ */

function Hero() {
  return (
    <section style={{ padding: 'clamp(56px, 10vw, 96px) 0 0' }}>
      <div className="k-container">

        {/* Eyebrow */}
        <div className="k-eyebrow animate-fade-in" style={{ marginBottom: '28px' }}>
          Karukasi — saudade em tupi-guarani
        </div>

        {/* H1 */}
        <h1
          className="k-display animate-fade-in"
          style={{
            fontSize: 'clamp(44px, 7.5vw, 104px)',
            marginBottom: '28px',
            animationDelay: '80ms',
          }}
        >
          <span style={{ display: 'block', whiteSpace: 'nowrap' }}>Uma última voz.</span>
          <em style={{ display: 'block', whiteSpace: 'nowrap', fontStyle: 'italic', color: 'var(--sand)' }}>
            Para sempre.
          </em>
        </h1>

        {/* Lede */}
        <p
          className="animate-fade-in"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(15px, 1.8vw, 17px)',
            color: 'var(--ink-soft)',
            maxWidth: '44ch',
            lineHeight: 1.65,
            marginBottom: '36px',
            animationDelay: '160ms',
          }}
        >
          Preserve a memória de quem você amou. Uma foto, algumas palavras,
          e uma última mensagem para guardar.
        </p>

        {/* CTA */}
        <div className="animate-fade-in" style={{ animationDelay: '240ms' }}>
          <Link href="/criar" className="k-btn-primary">
            Começar
            <svg className="k-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
              <path d="M2.5 11.5L11.5 2.5M11.5 2.5H4.5M11.5 2.5V9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* Landscape SVG */}
        <div
          className="animate-fade-in"
          style={{
            marginTop: 'clamp(40px, 6vw, 72px)',
            animationDelay: '360ms',
            borderRadius: 'var(--r-struct)',
            overflow: 'hidden',
          }}
        >
          <HeroLandscape />
        </div>
      </div>
    </section>
  )
}

function HeroLandscape() {
  return (
    <svg
      viewBox="0 0 1120 373"
      preserveAspectRatio="xMidYMid slice"
      className="k-hero-landscape"
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--bg-inset)" />
          <stop offset="100%" stopColor="var(--bg)" />
        </linearGradient>
        <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ink-muted)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--ink-muted)" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ink-muted)" stopOpacity="0.10" />
          <stop offset="100%" stopColor="var(--ink-muted)" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id="hill3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.06" />
          <stop offset="100%" stopColor="var(--ink)" stopOpacity="0.12" />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect width="1120" height="373" fill="url(#sky)" />

      {/* Distant hills */}
      <path
        d="M0 220 C80 180 180 160 280 155 C380 150 460 168 560 172 C660 176 740 162 840 158 C940 154 1040 168 1120 175 L1120 373 L0 373 Z"
        fill="url(#hill2)"
      />

      {/* Mid hills */}
      <path
        d="M0 260 C60 240 140 225 240 218 C340 211 420 230 520 236 C620 242 700 224 800 220 C900 216 1000 234 1120 242 L1120 373 L0 373 Z"
        fill="url(#hill1)"
      />

      {/* Foreground */}
      <path
        d="M0 310 C100 298 200 292 300 295 C400 298 480 308 580 312 C680 316 760 304 860 300 C960 296 1040 308 1120 316 L1120 373 L0 373 Z"
        fill="url(#hill3)"
      />

      {/* Horizon line */}
      <line x1="0" y1="220" x2="1120" y2="220" stroke="var(--line)" strokeWidth="0.8" />

      {/* Sun */}
      <circle cx="820" cy="150" r="28" fill="var(--sand)" fillOpacity="0.22" />
      <circle cx="820" cy="150" r="16" fill="var(--sand)" fillOpacity="0.28" />
    </svg>
  )
}

/* ============================================================
   HOW IT WORKS  (id="how")
   ============================================================ */

const NEEDS = [
  {
    num: '01',
    name: 'Foto do ente querido',
    desc: 'Uma imagem com o rosto visível. Preferimos fotos nítidas, mas antigas também servem.',
    tag: 'Obrigatório',
  },
  {
    num: '02',
    name: 'O que você gostaria de ouvir',
    desc: 'Até 500 caracteres. Pode ser uma frase curta, um recado, uma despedida.',
    tag: 'Obrigatório',
  },
  {
    num: '03',
    name: 'Referência de voz',
    desc: 'Um áudio com a voz original. Se não houver, aproximamos pela idade e gênero.',
    tag: 'Opcional',
  },
  {
    num: '04',
    name: 'Contexto adicional',
    desc: 'Até 300 caracteres sobre tom, ritmo ou estilo da fala. Se preferir, deixe em branco.',
    tag: 'Opcional',
  },
]

function HowItWorks() {
  return (
    <section id="how" className="k-section">
      <div className="k-container">

        {/* Section head */}
        <Reveal>
          <div className="k-section-head">
            <div className="k-label">O que é preciso</div>
            <div>
              <h2
                className="k-display"
                style={{ fontSize: 'clamp(32px, 4.2vw, 52px)' }}
              >
                Apenas o essencial.
              </h2>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--ink-soft)',
                lineHeight: 1.65,
              }}
            >
              Nada de cadastros, assinaturas, nem perguntas além das
              necessárias. Quatro informações, e o resto é silêncio.
            </p>
          </div>
        </Reveal>

        {/* Step list */}
        <div>
          {NEEDS.map((s, i) => (
            <Reveal key={s.num} delay={i * 80}>
              <div className="k-step-row">
                <span className="k-step-num k-label">{s.num}</span>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      fontWeight: 500,
                      color: 'var(--ink)',
                      marginBottom: '4px',
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'var(--ink-muted)',
                      lineHeight: 1.55,
                    }}
                  >
                    {s.desc}
                  </div>
                </div>
                <span className="k-step-tag">{s.tag}</span>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Bottom CTA */}
        <Reveal delay={200}>
          <div style={{ marginTop: '48px' }}>
            <Link href="/criar" className="k-btn-primary">
              Começar
              <svg className="k-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M2.5 11.5L11.5 2.5M11.5 2.5H4.5M11.5 2.5V9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ============================================================
   PRICING  (id="price")
   ============================================================ */

function Pricing() {
  return (
    <section id="price">
      <div className="k-container">
        <Reveal>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'baseline',
              gap: '24px 56px',
              padding: 'clamp(40px, 6vw, 72px) 0',
              borderTop: '1px solid var(--line)',
              borderBottom: '1px solid var(--line)',
            }}
          >
            {/* Number */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                className="k-display"
                style={{ fontSize: 'clamp(18px, 2vw, 22px)', color: 'var(--ink-muted)' }}
              >
                R$
              </span>
              <span
                className="k-price-num"
              >
                79
              </span>
            </div>

            {/* Notes */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p
                className="k-label"
                style={{ letterSpacing: '0.12em', textTransform: 'none', fontSize: '11px' }}
              >
                Pagamento seguro via Stripe.
              </p>
              <p
                className="k-label"
                style={{ letterSpacing: '0.12em', textTransform: 'none', fontSize: '11px' }}
              >
                Download imediato após a confirmação.
              </p>
              <p
                className="k-label"
                style={{ letterSpacing: '0.12em', textTransform: 'none', fontSize: '11px' }}
              >
                Sem assinaturas, sem surpresas.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/* ============================================================
   ABOUT THE NAME  (id="name")
   ============================================================ */

function AboutName() {
  return (
    <section id="name" className="k-section">
      <div className="k-container">
        <Reveal>
          <div className="k-label" style={{ marginBottom: '40px' }}>Sobre o nome</div>
        </Reveal>

        <div className="k-name-grid">
          {/* Left: name + pronunciation */}
          <Reveal>
            <div>
              <div
                className="k-display"
                style={{ fontSize: 'clamp(40px, 6vw, 80px)', marginBottom: '12px' }}
              >
                Karukasi
              </div>
              <div className="k-label">/ka·ru·ka·si/</div>
            </div>
          </Reveal>

          {/* Right: paragraphs */}
          <Reveal delay={120}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                lineHeight: 1.7,
                color: 'var(--ink-soft)',
              }}
            >
              <p>Karukasi significa saudade, em tupi-guarani.</p>
              <p>
                A escolha não foi acidental. O produto existe para preservar
                exatamente aquilo que o nome carrega: a saudade de quem já foi,
                transformada em algo que pode ser ouvido, guardado, revisitado.
              </p>
              <p>
                O nome se conecta a uma tradição oral muito anterior à escrita,
                a um tempo em que a memória dos ancestrais era transmitida pela
                voz. O que fazemos, de certa forma, continua esse gesto.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   FAQ  (id="faq")
   ============================================================ */

function FaqSection() {
  return (
    <section id="faq" className="k-section" style={{ borderTop: '1px solid var(--line)' }}>
      <div className="k-container">

        {/* Head */}
        <Reveal>
          <div style={{ marginBottom: '40px' }}>
            <div className="k-label" style={{ marginBottom: '16px' }}>Perguntas frequentes</div>
            <h2
              className="k-display"
              style={{ fontSize: 'clamp(32px, 4.2vw, 52px)' }}
            >
              O que costumam perguntar.
            </h2>
          </div>
        </Reveal>

        {/* Accordion */}
        <Reveal delay={80}>
          <FaqAccordion />
        </Reveal>
      </div>
    </section>
  )
}

/* ============================================================
   FOOTER
   ============================================================ */

function SiteFooter() {
  return (
    <footer className="k-footer">
      <div className="k-container">
        <span className="k-footer-wordmark">Karukasi</span>

        <div className="k-footer-bottom">
          <p
            className="k-label"
            style={{ letterSpacing: '0.12em', textTransform: 'none', color: 'var(--ink-muted)' }}
          >
            Karukasi — saudade, em tupi-guarani.
          </p>

          <nav
            style={{
              display: 'flex',
              gap: '24px',
              alignItems: 'center',
            }}
          >
            {[
              { label: 'Termos', href: '/termos' },
              { label: 'Privacidade', href: '/privacidade' },
              { label: 'Contato', href: 'mailto:contatokarukasi@gmail.com' },
            ].map(link => (
              <a
                key={link.label}
                href={link.href}
                className="k-label k-footer-link"
                style={{ letterSpacing: '0.12em' }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p
          className="k-label"
          style={{
            marginTop: '24px',
            letterSpacing: '0.10em',
            textTransform: 'none',
            color: 'var(--ink-muted)',
            fontSize: '10px',
          }}
        >
          © Karukasi 2026. Feito com cuidado.
        </p>
      </div>
    </footer>
  )
}
