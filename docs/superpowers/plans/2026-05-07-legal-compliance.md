# Legal Compliance — Termos, Consentimento e Disclaimers de IA

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar termos de uso, política de conteúdo, checkboxes de consentimento (com persistência), disclaimers de IA e links no rodapé — pronto para campanha paga de Dia das Mães.

**Architecture:** Mudanças aditivas. Nenhum fluxo de pagamento, billing ou geração é alterado. Consentimento é persistido como colunas novas na tabela `jobs` existente. Páginas estáticas são Next.js Server Components puros.

**Tech Stack:** Next.js 16 App Router, React 19, Supabase (SQL via dashboard), TypeScript

**Branch:** `feat/legal-compliance` — deploy apenas em staging; segurar produção até revisão jurídica.

---

## Arquivos que serão criados ou modificados

| Arquivo | Ação |
|---|---|
| `app/termos/page.tsx` | Criar |
| `app/politica-de-conteudo/page.tsx` | Criar |
| `components/CreationForm.tsx` | Modificar — adicionar 3 checkboxes + estado |
| `app/api/generate/route.ts` | Modificar — validar + persistir consentimento |
| `app/page.tsx` | Modificar — disclaimer no hero + link no rodapé |
| `components/PreviewPlayer.tsx` | Modificar — disclaimer acima do botão de compra |
| `components/FullVideoPlayer.tsx` | Modificar — disclaimer acima do botão de download |
| `lib/resend.ts` | Modificar — disclaimer no email |

---

## Task 1: Migration do Supabase

**Files:**
- (nenhum arquivo de código — executado via browser no Supabase dashboard)

- [ ] **Step 1: Abrir Supabase via Chrome e rodar o SQL**

Navegar para o Supabase dashboard → projeto karukasi → SQL Editor → New Query → colar e executar:

```sql
ALTER TABLE jobs
  ADD COLUMN IF NOT EXISTS consent_deceased  boolean,
  ADD COLUMN IF NOT EXISTS consent_ai        boolean,
  ADD COLUMN IF NOT EXISTS consent_terms     boolean,
  ADD COLUMN IF NOT EXISTS consent_at        timestamptz,
  ADD COLUMN IF NOT EXISTS consent_ip        text,
  ADD COLUMN IF NOT EXISTS consent_ua        text,
  ADD COLUMN IF NOT EXISTS consent_version   text;
```

Resultado esperado: `Success. No rows returned`

- [ ] **Step 2: Confirmar que as colunas existem**

No SQL Editor, rodar:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'jobs'
  AND column_name LIKE 'consent%'
ORDER BY column_name;
```

Resultado esperado: 7 linhas com os nomes das colunas acima.

---

## Task 2: Páginas estáticas

**Files:**
- Create: `app/termos/page.tsx`
- Create: `app/politica-de-conteudo/page.tsx`

- [ ] **Step 1: Criar `app/termos/page.tsx`**

```tsx
import Link from 'next/link'

export const metadata = {
  title: 'Termos de Uso · Karukasi',
}

export default function TermosPage() {
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
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Termos de Uso · Karukasi
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '48px' }}>
          Versão 1.0 · vigente a partir de 06/05/2026
        </p>

        <p style={{ marginBottom: '32px', fontSize: '15px', color: 'var(--ink-soft)' }}>
          O Karukasi (operado por Karukasi — contatokarukasi@gmail.com) é um serviço que cria vídeos de homenagem a partir de uma fotografia e de um texto fornecidos por você ("Usuário"). A voz e a animação são geradas por inteligência artificial.
        </p>
        <p style={{ marginBottom: '48px', fontSize: '15px', color: 'var(--ink-soft)' }}>
          Antes de usar o serviço, leia este termo. Ao marcar os checkboxes de aceite no formulário e ao concluir o pagamento, você declara que leu, entendeu e aceita integralmente as condições abaixo.
        </p>

        {[
          {
            title: '1. Natureza do serviço',
            items: [
              '1.1. O Karukasi gera um arquivo de vídeo com voz sintética e animação facial a partir do material que o Usuário fornece. O resultado é uma homenagem em vídeo (tributo), não uma representação fiel, factual ou histórica da pessoa retratada.',
              '1.2. O Usuário compreende que voz e movimento são produzidos por inteligência artificial e podem não corresponder à voz, expressão, gestos ou personalidade reais da pessoa retratada.',
              '1.3. O serviço não recria, não restitui e não substitui a pessoa retratada. É um artefato de memória.',
            ],
          },
          {
            title: '2. Declarações do Usuário',
            items: [
              'Ao usar o Karukasi, o Usuário declara, sob sua única responsabilidade, que:',
              '2.1. A pessoa retratada faleceu antes da data deste pedido.',
              '2.2. O Usuário possui autorização da família (cônjuge sobrevivente, filhos ou demais herdeiros legais) para criar uma homenagem em vídeo com a imagem e o nome da pessoa retratada.',
              '2.3. A pessoa retratada não é menor de idade na imagem fornecida.',
              '2.4. A pessoa retratada não é figura pública, política, religiosa ou celebridade sem autorização expressa de quem detenha os direitos sobre sua imagem.',
              '2.5. O Usuário detém ou tem licença para usar a fotografia fornecida.',
              '2.6. O Usuário não usará o vídeo gerado para fins comerciais, fraudulentos, difamatórios, ofensivos ou para induzir terceiros a erro sobre a vontade ou identidade da pessoa retratada.',
            ],
          },
          {
            title: '3. Indenização e regresso',
            items: [
              '3.1. Se qualquer das declarações da Cláusula 2 for falsa, incompleta ou imprecisa, e disso decorrer qualquer dano, reclamação, ação judicial, autuação administrativa, perda reputacional, custos de defesa, indenizações ou outras despesas suportadas pelo Karukasi ou por seus sócios/operadores, o Usuário se obriga a indenizar integralmente o Karukasi por todos os valores envolvidos, incluindo honorários advocatícios.',
              '3.2. Esta obrigação subsiste mesmo após a entrega do vídeo e o encerramento do contrato.',
            ],
          },
          {
            title: '4. Conduta proibida',
            items: [
              '4.1. É expressamente proibido: (a) usar fotografia de pessoa viva; (b) usar fotografia de criança ou adolescente; (c) usar fotografia de figura pública sem autorização; (d) gerar vídeo com texto difamatório, ofensivo, discriminatório ou que induza terceiros a engano; (e) compartilhar publicamente o vídeo afirmando que se trata de gravação real, mensagem real ou ato real da pessoa retratada; (f) revender, licenciar ou comercializar o vídeo gerado.',
              '4.2. O Karukasi reserva-se o direito de recusar qualquer pedido cuja conformidade com a Cláusula 2 ou com a Cláusula 4 lhe pareça duvidosa, sem reembolso.',
            ],
          },
          {
            title: '5. Limitação de responsabilidade',
            items: [
              '5.1. A responsabilidade total do Karukasi por qualquer dano direto ou indireto decorrente do uso do serviço fica limitada ao valor efetivamente pago pelo Usuário (R$79,00).',
              '5.2. A limitação acima não se aplica nos casos em que a lei expressamente vede tal limitação.',
            ],
          },
          {
            title: '6. Tratamento de dados (LGPD)',
            items: [
              '6.1. Dados pessoais do Usuário (nome, email, dados de pagamento) tratados com base em execução do contrato (art. 7º, V, LGPD).',
              '6.2. Imagem e texto fornecidos tratados com base em consentimento e nas declarações do Usuário (Cláusula 2). O Usuário é o controlador de fato dessas informações em relação à pessoa retratada.',
              '6.3. Os arquivos enviados são armazenados pelo prazo de 90 dias e excluídos automaticamente após esse período, salvo solicitação expressa do Usuário em contrário.',
              '6.4. Solicitações de exclusão antecipada: contatokarukasi@gmail.com.',
            ],
          },
          {
            title: '7. Propriedade intelectual',
            items: [
              '7.1. O Usuário retém os direitos sobre a fotografia e o texto que envia.',
              '7.2. O vídeo gerado é licenciado ao Usuário para uso pessoal e familiar, sem prazo. Veda-se o uso comercial.',
              '7.3. O Karukasi mantém os direitos sobre a tecnologia, a marca e os elementos visuais do serviço.',
            ],
          },
          {
            title: '8. Pagamento e reembolso',
            items: [
              '8.1. O serviço é cobrado em pagamento único de R$79,00.',
              '8.2. Reembolso é devido apenas quando o sistema falhar em gerar o vídeo após o pagamento e a falha for atribuível ao Karukasi.',
              '8.3. Não há reembolso quando o pedido for recusado por desconformidade com as Cláusulas 2 ou 4.',
            ],
          },
          {
            title: '9. Foro e legislação',
            items: [
              'Aplica-se a legislação brasileira (CDC, LGPD, Marco Civil). Foro do domicílio do Usuário-consumidor.',
            ],
          },
          {
            title: '10. Contato',
            items: ['contatokarukasi@gmail.com'],
          },
        ].map(section => (
          <section key={section.title} style={{ marginBottom: '40px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '18px', marginBottom: '16px', color: 'var(--ink)' }}>
              {section.title}
            </h2>
            {section.items.map((item, i) => (
              <p key={i} style={{ fontSize: '14px', color: 'var(--ink-soft)', marginBottom: '12px' }}>
                {item}
              </p>
            ))}
          </section>
        ))}
      </main>
    </div>
  )
}
```

- [ ] **Step 2: Criar `app/politica-de-conteudo/page.tsx`**

```tsx
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
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: '48px', letterSpacing: '-0.02em' }}>
          Política de Conteúdo · Karukasi
        </h1>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '18px', marginBottom: '16px' }}>
            O que aceitamos
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
            Fotografias de pessoas que faleceram, com autorização da família, em texto que celebra ou homenageia.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '18px', marginBottom: '16px' }}>
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
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '18px', marginBottom: '16px' }}>
            Como reportamos uso indevido
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
            Se identificarmos pedido em desacordo com esta política, recusamos a geração ou removemos o vídeo gerado sem reembolso, e podemos comunicar autoridades em casos graves.
          </p>
        </section>

        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: '18px', marginBottom: '16px' }}>
            Como você pode reportar
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-soft)' }}>
            contatokarukasi@gmail.com com documentos comprobatórios. Removemos o vídeo e investigamos em até 5 dias úteis.
          </p>
        </section>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Verificar no browser local**

```bash
npm run dev
```

Abrir `http://localhost:3000/termos` e `http://localhost:3000/politica-de-conteudo`. Verificar que o texto bate com o spec, links do header funcionam, sem erro de TypeScript no terminal.

- [ ] **Step 4: Commit**

```bash
git add app/termos/page.tsx app/politica-de-conteudo/page.tsx
git commit -m "feat: add /termos and /politica-de-conteudo static pages"
```

---

## Task 3: Checkboxes de consentimento no formulário

**Files:**
- Modify: `components/CreationForm.tsx`

- [ ] **Step 1: Adicionar estado dos 3 checkboxes em `CreationForm`**

Logo após a linha `const [context, setContext] = useState('')`, adicionar:

```tsx
  // Consent state
  const [consentDeceased, setConsentDeceased] = useState(false)
  const [consentAi, setConsentAi] = useState(false)
  const [consentTerms, setConsentTerms] = useState(false)
  const allConsentsChecked = consentDeceased && consentAi && consentTerms
```

- [ ] **Step 2: Atualizar `ctaEnabled` para incluir consentimento**

Localizar a linha:
```tsx
  const ctaEnabled = photo !== null && text.trim().length > 0
```

Substituir por:
```tsx
  const ctaEnabled = photo !== null && text.trim().length > 0 && allConsentsChecked
```

- [ ] **Step 3: Adicionar os 3 booleans ao FormData no `handleSubmit`**

Dentro do `try` do `handleSubmit`, após `if (context.trim()) formData.append('prompt', context)`, adicionar:

```tsx
      formData.append('consent_deceased', String(consentDeceased))
      formData.append('consent_ai', String(consentAi))
      formData.append('consent_terms', String(consentTerms))
```

- [ ] **Step 4: Adicionar o bloco de checkboxes no JSX**

Localizar o bloco `{/* ERROR */}` e inserir **antes** dele:

```tsx
      {/* CONSENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
        {[
          {
            id: 'consent-deceased',
            checked: consentDeceased,
            onChange: () => setConsentDeceased(v => !v),
            label: (
              <>
                A pessoa nas fotos faleceu, e eu tenho autorização da família para criar este vídeo em sua memória.
              </>
            ),
          },
          {
            id: 'consent-ai',
            checked: consentAi,
            onChange: () => setConsentAi(v => !v),
            label: (
              <>
                Entendo que a voz e a animação serão criadas por inteligência artificial. O vídeo é uma homenagem, não uma representação fiel da pessoa.
              </>
            ),
          },
          {
            id: 'consent-terms',
            checked: consentTerms,
            onChange: () => setConsentTerms(v => !v),
            label: (
              <>
                Li e aceito os{' '}
                <a href="/termos" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  Termos de Uso
                </a>
                {' '}e a{' '}
                <a href="/politica-de-conteudo" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  Política de Conteúdo
                </a>
                {' '}do Karukasi.
              </>
            ),
          },
        ].map(item => (
          <label
            key={item.id}
            htmlFor={item.id}
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
              cursor: 'pointer',
            }}
          >
            <input
              id={item.id}
              type="checkbox"
              checked={item.checked}
              onChange={item.onChange}
              style={{
                marginTop: '2px',
                flexShrink: 0,
                width: '16px',
                height: '16px',
                accentColor: 'var(--ink)',
                cursor: 'pointer',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: 'var(--ink-soft)',
                lineHeight: 1.6,
              }}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>
```

- [ ] **Step 5: Verificar no browser**

`http://localhost:3000/criar` — confirmar que:
- Os 3 checkboxes aparecem acima do botão
- O botão "Preparar a prévia" fica desabilitado enquanto algum checkbox está desmarcado
- Os links "Termos de Uso" e "Política de Conteúdo" abrem em nova aba
- Nenhum erro no console

- [ ] **Step 6: Commit**

```bash
git add components/CreationForm.tsx
git commit -m "feat: add consent checkboxes to creation form"
```

---

## Task 4: Validação e persistência do consentimento no servidor

**Files:**
- Modify: `app/api/generate/route.ts`

- [ ] **Step 1: Ler e validar os 3 campos de consentimento no handler POST**

Após a linha `const additionalPrompt = (formData.get('prompt') as string | null)?.trim() || undefined`, adicionar:

```ts
  const consentDeceased = formData.get('consent_deceased') === 'true'
  const consentAi       = formData.get('consent_ai')       === 'true'
  const consentTerms    = formData.get('consent_terms')    === 'true'

  if (!consentDeceased || !consentAi || !consentTerms) {
    return NextResponse.json(
      { message: 'É necessário aceitar todos os termos para continuar.' },
      { status: 400 }
    )
  }
```

- [ ] **Step 2: Extrair IP e user-agent**

Logo após o bloco de validação de consentimento:

```ts
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
  const ua = req.headers.get('user-agent') ?? 'unknown'
```

- [ ] **Step 3: Persistir consentimento junto com a criação do job**

Localizar o insert:
```ts
  const { data: jobRow, error: insertError } = await supabase
    .from('jobs')
    .insert({ status: 'pending' })
```

Substituir por:
```ts
  const { data: jobRow, error: insertError } = await supabase
    .from('jobs')
    .insert({
      status: 'pending',
      consent_deceased: consentDeceased,
      consent_ai:       consentAi,
      consent_terms:    consentTerms,
      consent_at:       new Date().toISOString(),
      consent_ip:       ip,
      consent_ua:       ua,
      consent_version:  'v1.0',
    })
```

- [ ] **Step 4: Testar via formulário**

No browser, preencher o formulário com os 3 checkboxes marcados e submeter. Verificar no Supabase dashboard (Table Editor → jobs) que o registro criado tem as colunas `consent_*` preenchidas.

Testar também tentar submeter via `curl` sem os campos de consentimento:

```bash
curl -X POST http://localhost:3000/api/generate \
  -F "photo=@/tmp/test.jpg" \
  -F "text=Teste" \
  -F "voice_id=21m00Tcm4TlvDq8ikWAM"
```

Resultado esperado: `{"message":"É necessário aceitar todos os termos para continuar."}` com status 400.

- [ ] **Step 5: Commit**

```bash
git add app/api/generate/route.ts
git commit -m "feat: validate and persist consent on job creation"
```

---

## Task 5: Disclaimers de IA na interface

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/PreviewPlayer.tsx`
- Modify: `components/FullVideoPlayer.tsx`

### 5a — Hero (landing page)

- [ ] **Step 1: Adicionar disclaimer abaixo do landscape SVG em `Hero()`**

Localizar, dentro de `Hero()`, o bloco do landscape SVG:
```tsx
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
```

Adicionar **depois** desse `</div>` (ainda dentro do `<div className="k-container">`):

```tsx
        {/* AI disclaimer */}
        <p
          className="animate-fade-in"
          style={{
            marginTop: '16px',
            animationDelay: '440ms',
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--ink-muted)',
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}
        >
          Voz e animação criadas por inteligência artificial.
        </p>
```

### 5b — Paywall (PreviewPlayer)

- [ ] **Step 2: Adicionar disclaimer acima do botão de compra em `PreviewPlayer.tsx`**

Localizar o bloco `{/* Buttons */}` dentro do painel direito:
```tsx
        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={onPaymentClick}
```

Adicionar **antes** desse `{/* Buttons */}`:

```tsx
        {/* AI disclaimer */}
        <div
          style={{
            padding: '14px 16px',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-card)',
            background: 'var(--bg-inset)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--ink-soft)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            O vídeo que você acabou de pré-visualizar foi criado por inteligência artificial a partir da foto e do texto que você enviou. É uma homenagem em vídeo, não uma gravação real da pessoa.
          </p>
        </div>
```

### 5c — Pós-compra (FullVideoPlayer)

- [ ] **Step 3: Adicionar disclaimer acima do botão de download em `FullVideoPlayer.tsx`**

Localizar o bloco `{/* Buttons */}`:
```tsx
      {/* Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', width: '100%', maxWidth: '320px' }}>
        <button
          onClick={handleDownload}
```

Adicionar **antes** desse `{/* Buttons */}`:

```tsx
      {/* AI disclaimer */}
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--ink-soft)',
          lineHeight: 1.65,
          maxWidth: '320px',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Pronto. Sua homenagem está disponível. Lembre-se: voz e animação foram criadas por IA. Guarde o vídeo com carinho — e use apenas para a memória da família.
      </p>
```

- [ ] **Step 4: Verificar no browser**

- `http://localhost:3000/` — confirmar texto pequeno abaixo da paisagem do hero
- `http://localhost:3000/result/<job_id>` em estado `preview_ready` — confirmar caixa de disclaimer acima do preço/botão
- `http://localhost:3000/result/<job_id>` em estado `completed` — confirmar texto acima do botão de download

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx components/PreviewPlayer.tsx components/FullVideoPlayer.tsx
git commit -m "feat: add AI disclaimers to hero, paywall, and post-purchase"
```

---

## Task 6: Disclaimer no email

**Files:**
- Modify: `lib/resend.ts`

- [ ] **Step 1: Adicionar disclaimer acima do link de download no HTML do email**

Localizar em `lib/resend.ts` o parágrafo de abertura do email:
```ts
          <p style="font-size: 1rem; line-height: 1.7; color: rgba(26,26,26,0.7); margin: 0 0 32px;">
            O vídeo memorial está pronto para ser guardado.
          </p>
```

Substituir por:

```ts
          <p style="font-size: 1rem; line-height: 1.7; color: rgba(26,26,26,0.7); margin: 0 0 24px;">
            O vídeo memorial está pronto para ser guardado.
          </p>
          <p style="font-size: 0.8125rem; line-height: 1.65; color: rgba(26,26,26,0.55); margin: 0 0 32px; padding: 14px 16px; border: 1px solid rgba(26,26,26,0.12); border-radius: 4px;">
            Anexamos abaixo o vídeo que você criou no Karukasi. Voz e animação foram geradas por inteligência artificial a partir da foto e do texto que você enviou. Este vídeo é uma homenagem em vídeo — não uma gravação real da pessoa retratada. Para uso pessoal e familiar. Por favor, ao compartilhar com outras pessoas da família, mencione que se trata de uma homenagem criada por IA.
          </p>
```

- [ ] **Step 2: Commit**

```bash
git add lib/resend.ts
git commit -m "feat: add AI disclaimer to delivery email"
```

---

## Task 7: Links no rodapé

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Adicionar "Política de Conteúdo" ao array de links do rodapé**

Localizar em `SiteFooter()` o array de links:
```tsx
            {[
              { label: 'Termos', href: '/termos' },
              { label: 'Privacidade', href: '/privacidade' },
              { label: 'Contato', href: 'mailto:contatokarukasi@gmail.com' },
            ].map(link => (
```

Substituir por:
```tsx
            {[
              { label: 'Termos', href: '/termos' },
              { label: 'Política de Conteúdo', href: '/politica-de-conteudo' },
              { label: 'Contato', href: 'mailto:contatokarukasi@gmail.com' },
            ].map(link => (
```

(O link "Privacidade" não existe como página ainda — removemos para não termos link quebrado. Se quiser manter, podemos, mas o spec não menciona essa página.)

- [ ] **Step 2: Verificar no browser**

`http://localhost:3000/` → rodapé → confirmar que "Política de Conteúdo" aparece e navega corretamente para `/politica-de-conteudo`.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: update footer links — add politica-de-conteudo, remove broken privacidade"
```

---

## Task 8: Build final + PR

- [ ] **Step 1: Rodar build completo**

```bash
npm run build
```

Resultado esperado: sem erros de TypeScript ou compilação. Warnings são aceitáveis.

- [ ] **Step 2: Rodar testes**

```bash
npm test
```

Resultado esperado: todos os testes passam (ou mesma quantidade de falhas que antes das mudanças — nenhuma regressão).

- [ ] **Step 3: Abrir PR apontando para main**

```bash
gh pr create \
  --title "feat: legal compliance — termos, consentimento e disclaimers de IA" \
  --body "$(cat <<'EOF'
## O que entra

- Páginas estáticas `/termos` e `/politica-de-conteudo`
- 3 checkboxes de consentimento obrigatórios no formulário (bloqueiam submit)
- Validação server-side + persistência no Supabase (7 colunas novas em `jobs`)
- Disclaimer de IA: hero, paywall, pós-compra e email de entrega
- Rodapé: link "Política de Conteúdo" substituindo "Privacidade" (página inexistente)

## O que NÃO entra

- Marca d'água no MP4 (removida do escopo)
- Nenhuma alteração no fluxo de pagamento, geração de vídeo ou billing

## Deploy

**Staging only.** Segurar produção até revisão jurídica dos termos.

## Checklist pre-merge

- [ ] Migration SQL rodada no Supabase staging
- [ ] Revisão jurídica dos Termos de Uso aprovada
- [ ] Teste manual completo do fluxo no staging
EOF
)"
```

---

## Notas

- **Revisão jurídica**: Os termos estão implementados como rascunho. Não subir para produção sem revisão de advogado.
- **Migration**: SQL da Task 1 precisa ser rodado manualmente no Supabase do staging (e depois, quando aprovar, no de produção).
- **Link "Privacidade"**: Removido do rodapé por não ter página correspondente. Adicionar de volta quando criar a página.
