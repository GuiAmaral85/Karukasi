'use client'

import { useState } from 'react'

const FAQ_ITEMS = [
  {
    q: 'Como é feito o vídeo?',
    a: 'A partir da foto, animamos o rosto com sutileza — apenas o suficiente para acompanhar a fala. A voz é gerada com base no áudio que você enviar, ou aproximada por características que você escolhe.',
  },
  {
    q: 'Preciso pagar antes de ver o resultado?',
    a: 'Não. Você recebe uma prévia de três segundos, gratuitamente, para decidir se quer guardar o vídeo completo. Só há cobrança se você seguir.',
  },
  {
    q: 'O que acontece com a foto e o áudio que envio?',
    a: 'São usados apenas para gerar o seu vídeo. Depois da entrega, removemos os arquivos dos nossos servidores. Nada é usado para treinar modelos, nada é compartilhado.',
  },
  {
    q: 'Posso encomendar mais de um vídeo?',
    a: 'Pode. Cada vídeo é uma transação única. Não há conta, não há assinatura — basta começar novamente quando sentir vontade.',
  },
  {
    q: 'Em quais formatos o vídeo é entregue?',
    a: 'MP4 em alta resolução, pronto para ser guardado, enviado a familiares, ou transferido para um dispositivo de sua preferência.',
  },
  {
    q: 'É possível pedir ajuda humana durante o processo?',
    a: 'Sim. Se em algum momento algo não fizer sentido, você pode escrever para contatokarukasi@gmail.com. Respondemos pessoalmente, com o tempo que for preciso.',
  },
]

export default function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="k-faq-list">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className="k-faq-item">
          <button
            className="k-faq-btn"
            aria-expanded={open === i}
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{item.q}</span>
            <span className="k-faq-plus" aria-hidden />
          </button>
          <div className={`k-faq-answer${open === i ? ' open' : ''}`}>
            <p className="k-faq-answer-inner">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
