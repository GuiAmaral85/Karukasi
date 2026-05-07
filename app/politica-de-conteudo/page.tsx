import Link from 'next/link'

export const metadata = {
  title: 'Política de Conteúdo · Karukasi',
}

export default function PoliticaDeConteudoPage() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      <header className="k-flow-header">
        <Link href="/" className="k-wordmark" style={{ fontSize: '1rem' }}>
          Karukasi
        </Link>
      </header>

      <main
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: 'clamp(48px, 8vw, 80px) var(--gutter)',
          fontFamily: 'var(--font-body)',
          color: 'var(--ink)',
          lineHeight: 1.75,
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(28px, 4vw, 40px)',
            marginBottom: '48px',
            letterSpacing: '-0.02em',
          }}
        >
          Política de Conteúdo · Karukasi
        </h1>

        <section style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '18px',
              marginBottom: '16px',
            }}
          >
            O que aceitamos
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
            Fotografias de pessoas que faleceram, com autorização da família, em texto que celebra ou
            homenageia.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '18px',
              marginBottom: '16px',
            }}
          >
            O que não aceitamos
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '16px' }}>
            Podemos recusar pedidos sem reembolso:
          </p>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              'Fotografias de pessoas vivas, sob qualquer pretexto.',
              'Fotografias de crianças ou adolescentes.',
              'Figuras públicas sem autorização escrita de quem detém os direitos.',
              'Textos com conteúdo difamatório, ofensivo, discriminatório, racista, sexista, homofóbico ou capaz de induzir terceiros a engano.',
              'Pedidos onde o texto fornecido sugere fala da pessoa em vida. O Karukasi cria homenagem narrada, não simulação de fala da pessoa.',
            ].map((item, i) => (
              <li key={i} style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '18px',
              marginBottom: '16px',
            }}
          >
            Como reportamos uso indevido
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
            Se identificarmos pedido em desacordo com esta política, recusamos a geração ou removemos
            o vídeo gerado sem reembolso, e podemos comunicar autoridades em casos graves.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 400,
              fontSize: '18px',
              marginBottom: '16px',
            }}
          >
            Como você pode reportar
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
            contatokarukasi@gmail.com com documentos comprobatórios. Removemos o vídeo e investigamos
            em até 5 dias úteis.
          </p>
        </section>
      </main>
    </div>
  )
}
