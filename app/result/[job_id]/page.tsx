'use client'

import Link from 'next/link'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import type { Job } from '@/types'
import ProcessingState from '@/components/ProcessingState'
import PreviewPlayer from '@/components/PreviewPlayer'
import FullVideoPlayer from '@/components/FullVideoPlayer'
import ThemeToggle from '@/components/ThemeToggle'

export default function ResultPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const jobId = params.job_id as string
  const returnedSessionId = searchParams.get('session_id')

  const [job, setJob] = useState<Job | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  // True while we have a session_id back from Stripe but haven't confirmed paid yet
  const [awaitingPaymentConfirm, setAwaitingPaymentConfirm] = useState(!!returnedSessionId)

  // Refs to track terminal state without stale closure issues
  const jobRef = useRef<Job | null>(null)
  const awaitingPaymentRef = useRef(!!returnedSessionId)

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) throw new Error()
      const data: Job = await res.json()
      jobRef.current = data
      setJob(data)
      setFetchError(null)
      if (data.paid) {
        awaitingPaymentRef.current = false
        setAwaitingPaymentConfirm(false)
      }
    } catch {
      setFetchError('Não foi possível verificar o status do vídeo.')
    }
  }, [jobId])

  // On mount — if session_id is present, call verify-payment immediately as
  // a fallback in case the Stripe webhook was missed (stripe listen not running, etc.)
  useEffect(() => {
    if (!returnedSessionId) return
    fetch('/api/verify-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: returnedSessionId, job_id: jobId }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.paid) {
          // Payment confirmed via direct Stripe API — refresh job state
          fetchJob()
        }
      })
      .catch(() => {/* best-effort */})
  }, [returnedSessionId, jobId, fetchJob])

  // Normal polling — every 5s, stops when terminal state reached
  useEffect(() => {
    fetchJob()
    const interval = setInterval(() => {
      const current = jobRef.current
      if (current?.status === 'completed' || current?.status === 'failed') {
        clearInterval(interval)
        return
      }
      fetchJob()
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchJob])

  // Fast polling — every 2s while waiting for payment confirmation
  useEffect(() => {
    if (!returnedSessionId) return
    const interval = setInterval(() => {
      if (awaitingPaymentRef.current === false || jobRef.current?.paid) {
        clearInterval(interval)
        return
      }
      fetchJob()
    }, 2000)
    // Also stop after 60s regardless (safety net)
    const timeout = setTimeout(() => {
      clearInterval(interval)
      awaitingPaymentRef.current = false
      setAwaitingPaymentConfirm(false)
    }, 60_000)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [returnedSessionId, fetchJob])

  const handlePaymentClick = async () => {
    setIsCheckingOut(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })
      if (!res.ok) throw new Error()
      const { url } = await res.json()
      window.location.href = url
    } catch {
      setIsCheckingOut(false)
    }
  }

  // — Layout shell —
  const shell = (content: React.ReactNode) => (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
      {/* Minimal header */}
      <header className="k-flow-header">
        <Link href="/" className="k-wordmark" style={{ fontSize: '1rem' }}>
          Karukasi
        </Link>
        <div style={{ flex: 1 }} />
        <ThemeToggle />
      </header>

      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: 'clamp(48px, 8vw, 80px) var(--gutter)',
        }}
      >
        {content}
      </div>
    </div>
  )

  // — Error —
  if (fetchError) {
    return shell(
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
        <p className="k-display" style={{ fontSize: '22px', color: 'var(--ink-soft)' }}>
          {fetchError}
        </p>
        <button
          onClick={fetchJob}
          className="k-btn-ghost"
          style={{ fontSize: '13px' }}
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // — Loading / Processing —
  if (!job || job.status === 'pending' || job.status === 'processing_preview') {
    return shell(<ProcessingState />)
  }

  // — Failed —
  if (job.status === 'failed') {
    return shell(
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center', padding: 'clamp(64px, 10vw, 96px) 0' }}>
        <h2 className="k-display" style={{ fontSize: 'clamp(22px, 3vw, 32px)', color: 'var(--ink-soft)' }}>
          Não foi possível gerar o vídeo.
        </h2>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-muted)', maxWidth: '40ch' }}>
          Algo deu errado durante o processamento. Tente novamente com uma foto diferente.
        </p>
        <Link href="/criar" className="k-btn-primary">
          Tentar novamente
        </Link>
      </div>
    )
  }

  // — Awaiting Stripe webhook confirmation after redirect —
  if (awaitingPaymentConfirm && !job.paid) {
    return shell(
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'clamp(80px, 14vw, 140px) 0', gap: '24px', textAlign: 'center' }}>
        <div className="k-progress-track" style={{ width: '200px' }}>
          <div className="k-progress-bar" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p className="k-display" style={{ fontSize: '22px' }}>Confirmando pagamento…</p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--ink-muted)', margin: 0 }}>
            Aguardando confirmação do Stripe. Isso leva apenas alguns segundos.
          </p>
        </div>
      </div>
    )
  }

  // — Preview (not yet paid) —
  if (job.status === 'preview_ready' && !job.paid && job.preview_url) {
    return shell(
      <PreviewPlayer
        previewUrl={job.preview_url}
        jobId={jobId}
        onPaymentClick={handlePaymentClick}
        isCheckingOut={isCheckingOut}
      />
    )
  }

  // — Preview paid, processing full video —
  if (
    (job.status === 'preview_ready' && job.paid) ||
    job.status === 'processing_full'
  ) {
    return shell(
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', alignItems: 'center' }}>
        <ProcessingState mode="full" onRefresh={fetchJob} />
        {job.preview_url && (
          <div style={{ width: '100%', maxWidth: '320px', opacity: 0.5 }}>
            <video
              src={job.preview_url}
              muted
              playsInline
              style={{ width: '100%', display: 'block', borderRadius: 'var(--r-struct)', filter: 'saturate(0)' }}
            />
          </div>
        )}
      </div>
    )
  }

  // — Completed —
  if (job.status === 'completed' && job.full_video_url) {
    return shell(<FullVideoPlayer videoUrl={job.full_video_url} />)
  }

  // — Fallback —
  return shell(<ProcessingState />)
}
