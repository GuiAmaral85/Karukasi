/**
 * Smoke test para ElevenLabs e HeyGen.
 * Run: npx tsx scripts/test-apis.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

function die(msg: string): never {
  console.error('\x1b[31m✗\x1b[0m', msg)
  process.exit(1)
}

function ok(msg: string) {
  console.log('\x1b[32m✓\x1b[0m', msg)
}

function section(msg: string) {
  console.log(`\n\x1b[36m── ${msg} ──\x1b[0m`)
}

async function testElevenLabs() {
  section('ElevenLabs')

  const key = process.env.ELEVENLABS_API_KEY
  if (!key) die('ELEVENLABS_API_KEY ausente')

  // 1) Verificar conta
  const userRes = await fetch('https://api.elevenlabs.io/v1/user', {
    headers: { 'xi-api-key': key },
  })
  if (!userRes.ok) die(`ElevenLabs user check falhou: ${userRes.status} ${await userRes.text()}`)
  const user = await userRes.json() as any
  ok(`Conta: ${user.first_name ?? user.email ?? 'OK'} | Plano: ${user.subscription?.tier ?? 'unknown'}`)

  // 2) Listar vozes disponíveis
  const voicesRes = await fetch('https://api.elevenlabs.io/v1/voices', {
    headers: { 'xi-api-key': key },
  })
  if (!voicesRes.ok) die(`ElevenLabs voices falhou: ${voicesRes.status}`)
  const { voices } = await voicesRes.json() as any
  ok(`Vozes disponíveis: ${voices.length} (inclui clonadas e padrão)`)

  // 3) TTS rápido (voz padrão "Rachel")
  const rachelVoiceId = '21m00Tcm4TlvDq8ikWAM'
  const ttsRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${rachelVoiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': key,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: 'Karukasi. Uma memória que nunca se apaga.',
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })
  if (!ttsRes.ok) die(`TTS falhou: ${ttsRes.status} ${await ttsRes.text()}`)
  const audioBuffer = await ttsRes.arrayBuffer()
  ok(`TTS ok — ${Math.round(audioBuffer.byteLength / 1024)} KB de áudio gerado`)
}

async function testHeyGen() {
  section('HeyGen')

  const key = process.env.HEYGEN_API_KEY
  if (!key) die('HEYGEN_API_KEY ausente')

  // 1) Verificar key e conta via v3
  const meRes = await fetch('https://api.heygen.com/v3/users/me', {
    headers: { 'X-Api-Key': key },
  })
  if (!meRes.ok) die(`HeyGen auth falhou: ${meRes.status} ${await meRes.text()}`)
  const me = await meRes.json() as any
  const user = me.data ?? me
  ok(`API key válida — ${user.email ?? user.username ?? 'conta confirmada'}`)

  // 2) Créditos restantes
  const credits = user.credits ?? user.remaining_quota ?? user.quota
  if (credits !== undefined) ok(`Créditos: ${JSON.stringify(credits)}`)

  // 3) Confirmar que v2 talking_photo endpoint ainda responde (usado pelo pipeline)
  const tpRes = await fetch('https://api.heygen.com/v2/avatars', {
    headers: { 'X-Api-Key': key },
  })
  if (tpRes.ok) {
    const tp = await tpRes.json() as any
    const count = tp.data?.avatars?.length ?? 0
    ok(`v2 avatars endpoint ok (${count} avatar(s) disponível)`)
  } else {
    console.log('\x1b[33m⚠\x1b[0m', `v2 avatars retornou ${tpRes.status} (não crítico)`)
  }
}

async function main() {
  await testElevenLabs()
  await testHeyGen()
  console.log('\n\x1b[32m✓ APIs prontas.\x1b[0m\n')
}

main().catch(err => {
  console.error('\x1b[31m✗ erro inesperado:\x1b[0m', err)
  process.exit(1)
})
