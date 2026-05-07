import { Resend } from 'resend'

function getResendClient(): Resend {
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error('Missing RESEND_API_KEY')
  return new Resend(key)
}

// Send a download link email after full video is ready.
// Silently logs on failure — email is optional for MVP.
export async function sendDownloadEmail(
  to: string,
  videoUrl: string,
  jobId: string
): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const resultUrl = `${appUrl}/result/${jobId}`

  try {
    const resend = getResendClient()
    await resend.emails.send({
      from: 'Karukasi <memoria@karukasi.com>',
      to,
      subject: 'O seu vídeo memorial está pronto',
      html: `
        <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 24px; color: #1A1A1A;">
          <h1 style="font-weight: 300; font-size: 2rem; letter-spacing: -0.02em; margin: 0 0 24px;">
            Karukasi
          </h1>
          <p style="font-size: 1rem; line-height: 1.7; color: rgba(26,26,26,0.7); margin: 0 0 24px;">
            O vídeo memorial está pronto para ser guardado.
          </p>
          <p style="font-size: 0.8125rem; line-height: 1.65; color: rgba(26,26,26,0.55); margin: 0 0 32px; padding: 14px 16px; border: 1px solid rgba(26,26,26,0.12); border-radius: 4px;">
            Anexamos abaixo o vídeo que você criou no Karukasi. Voz e animação foram geradas por inteligência artificial a partir da foto e do texto que você enviou. Este vídeo é uma homenagem em vídeo — não uma gravação real da pessoa retratada. Para uso pessoal e familiar. Por favor, ao compartilhar com outras pessoas da família, mencione que se trata de uma homenagem criada por IA.
          </p>
          <a href="${resultUrl}"
             style="display: inline-block; border: 1px solid #C4A4A4; padding: 12px 32px;
                    font-size: 0.875rem; color: #1A1A1A; text-decoration: none; border-radius: 2px;">
            Ver e baixar o vídeo
          </a>
          <p style="margin: 48px 0 0; font-size: 0.75rem; color: rgba(26,26,26,0.3); font-style: italic;">
            Guarde este vídeo com carinho.
          </p>
        </div>
      `,
    })
  } catch (err) {
    // Email is optional — log but don't throw
    console.error('[resend] sendDownloadEmail failed', { to, jobId, err })
  }
}
