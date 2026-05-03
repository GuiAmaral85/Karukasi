/**
 * Smoke test for ElevenLabs API.
 * Run: npx tsx scripts/test-elevenlabs.ts
 *
 * Checks:
 *   1. ELEVENLABS_API_KEY is present
 *   2. Account info is reachable (key is valid)
 *   3. Subscription allows Instant Voice Cloning
 *   4. TTS works with a default voice
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

config({ path: resolve(process.cwd(), '.env.local') })

const BASE_URL = 'https://api.elevenlabs.io'
const apiKey = process.env.ELEVENLABS_API_KEY

function die(msg: string): never {
  console.error('\x1b[31m✗\x1b[0m', msg)
  process.exit(1)
}

function ok(msg: string) {
  console.log('\x1b[32m✓\x1b[0m', msg)
}

async function main() {
  if (!apiKey) die('ELEVENLABS_API_KEY ausente no .env.local')
  ok('env carregada')

  // 1) User info — valida a chave
  const userRes = await fetch(`${BASE_URL}/v1/user`, {
    headers: { 'xi-api-key': apiKey },
  })
  if (!userRes.ok) {
    die(`/v1/user falhou: ${userRes.status} ${await userRes.text()}`)
  }
  const user = await userRes.json()
  const tier = user.subscription?.tier ?? 'unknown'
  const canCloneInstant = user.subscription?.can_use_instant_voice_cloning ?? false
  ok(`API key válida (tier=${tier}, instant_voice_cloning=${canCloneInstant})`)

  if (!canCloneInstant) {
    die(`plano "${tier}" não permite Instant Voice Cloning — precisa Starter ou superior`)
  }

  // 2) List voices — confirma que /v1/voices responde
  const voicesRes = await fetch(`${BASE_URL}/v1/voices`, {
    headers: { 'xi-api-key': apiKey },
  })
  if (!voicesRes.ok) die(`/v1/voices falhou: ${voicesRes.status}`)
  const voices = await voicesRes.json()
  const voiceCount = voices.voices?.length ?? 0
  const firstDefault = voices.voices?.find((v: { category?: string }) => v.category === 'premade')
  if (!firstDefault) die('nenhuma voz premade encontrada (inesperado)')
  ok(`${voiceCount} vozes disponíveis (usando "${firstDefault.name}" para teste TTS)`)

  // 3) TTS — gera um mp3 curto
  const text = 'Teste de voz do Karukasi. Se você consegue ouvir isso, a integração está funcionando.'
  const ttsRes = await fetch(`${BASE_URL}/v1/text-to-speech/${firstDefault.voice_id}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0,
        use_speaker_boost: true,
      },
    }),
  })
  if (!ttsRes.ok) {
    die(`TTS falhou: ${ttsRes.status} ${await ttsRes.text()}`)
  }
  const audio = Buffer.from(await ttsRes.arrayBuffer())
  const outPath = resolve(process.cwd(), 'tmp-elevenlabs-smoketest.mp3')
  writeFileSync(outPath, audio)
  ok(`TTS ok (${audio.length} bytes salvos em ${outPath})`)

  console.log('\n\x1b[32m✓ ElevenLabs está pronto.\x1b[0m')
  console.log(`\n  abra o arquivo para confirmar áudio: open "${outPath}"`)
}

main().catch(err => {
  console.error('\x1b[31m✗ erro inesperado:\x1b[0m', err)
  process.exit(1)
})
