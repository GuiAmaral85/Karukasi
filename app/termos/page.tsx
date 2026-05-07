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
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 300,
            fontSize: 'clamp(28px, 4vw, 40px)',
            marginBottom: '8px',
            letterSpacing: '-0.02em',
          }}
        >
          Termos de Uso · Karukasi
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-muted)', marginBottom: '48px' }}>
          Versão 1.0 · vigente a partir de 06/05/2026
        </p>

        <p style={{ marginBottom: '32px', fontSize: '15px', color: 'var(--ink-soft)' }}>
          O Karukasi (operado por Karukasi — contatokarukasi@gmail.com) é um serviço que cria vídeos
          de homenagem a partir de uma fotografia e de um texto fornecidos por você ("Usuário"). A voz
          e a animação são geradas por inteligência artificial.
        </p>
        <p style={{ marginBottom: '48px', fontSize: '15px', color: 'var(--ink-soft)' }}>
          Antes de usar o serviço, leia este termo. Ao marcar os checkboxes de aceite no formulário e
          ao concluir o pagamento, você declara que leu, entendeu e aceita integralmente as condições
          abaixo.
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
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 400,
                fontSize: '18px',
                marginBottom: '16px',
                color: 'var(--ink)',
              }}
            >
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
