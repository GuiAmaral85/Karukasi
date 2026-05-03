/**
 * Smoke test for Supabase connection.
 * Run: npx tsx scripts/test-supabase.ts
 *
 * Checks:
 *   1. Env vars are present
 *   2. Can insert + select + delete a row in `jobs`
 *   3. Can upload + read-public + delete a file in the `karukasi` bucket
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { resolve } from 'path'

config({ path: resolve(process.cwd(), '.env.local') })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function die(msg: string): never {
  console.error('\x1b[31m✗\x1b[0m', msg)
  process.exit(1)
}

function ok(msg: string) {
  console.log('\x1b[32m✓\x1b[0m', msg)
}

async function main() {
  if (!url) die('NEXT_PUBLIC_SUPABASE_URL ausente no .env.local')
  if (!serviceKey) die('SUPABASE_SERVICE_ROLE_KEY ausente no .env.local')
  ok(`env carregadas (url=${url})`)

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // 1) Insert + select + delete
  const { data: inserted, error: insertErr } = await supabase
    .from('jobs')
    .insert({ status: 'smoketest' })
    .select()
    .single()
  if (insertErr) die(`insert falhou: ${insertErr.message}`)
  ok(`insert ok (id=${inserted.id})`)

  const { error: selectErr } = await supabase
    .from('jobs')
    .select('id, status, created_at')
    .eq('id', inserted.id)
    .single()
  if (selectErr) die(`select falhou: ${selectErr.message}`)
  ok('select ok')

  const { error: deleteErr } = await supabase
    .from('jobs')
    .delete()
    .eq('id', inserted.id)
  if (deleteErr) die(`delete falhou: ${deleteErr.message}`)
  ok('delete ok')

  // 2) Storage bucket
  const bucket = 'karukasi'
  const testPath = `smoketest/${Date.now()}.txt`
  const testContent = new TextEncoder().encode('karukasi-smoketest')

  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(testPath, testContent, { contentType: 'text/plain', upsert: true })
  if (uploadErr) {
    die(
      `upload falhou: ${uploadErr.message} — confirme que o bucket "${bucket}" existe e é PUBLIC`,
    )
  }
  ok(`upload ok (path=${testPath})`)

  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(testPath)
  if (!publicUrl?.publicUrl) die('getPublicUrl falhou')

  // Fetch the public URL to confirm it's actually reachable (bucket is truly public)
  const resp = await fetch(publicUrl.publicUrl)
  if (!resp.ok) {
    die(
      `public URL retornou ${resp.status}: ${publicUrl.publicUrl} — o bucket provavelmente não é público`,
    )
  }
  const fetched = await resp.text()
  if (fetched !== 'karukasi-smoketest') die(`conteúdo público incorreto: "${fetched}"`)
  ok(`public URL acessível: ${publicUrl.publicUrl}`)

  const { error: removeErr } = await supabase.storage.from(bucket).remove([testPath])
  if (removeErr) die(`remove falhou: ${removeErr.message}`)
  ok('remove ok')

  console.log('\n\x1b[32m✓ Supabase está pronto.\x1b[0m')
}

main().catch(err => {
  console.error('\x1b[31m✗ erro inesperado:\x1b[0m', err)
  process.exit(1)
})
