'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import type { Job } from '@/types'
import ProcessingState from '@/components/ProcessingState'
import PreviewPlayer from '@/components/PreviewPlayer'
import FullVideoPlayer from '@/components/FullVideoPlayer'

export default function ResultPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const jobId = params.job_id as string
  const returnedSessionId = searchParams.get('session_id')

  const [job, setJob] = useState<Job | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`)
      if (!res.ok) throw new Error()
      setJob(await res.json())
      setFetchError(null)
    } catch {
      setFetchError('Não foi possível verificar o status do vídeo.')
    }
  }, [jobId])

  useEffect(() => {
    fetchJob()
    const interval = setInterval(() => {
      setJob(prev => {
        if (prev?.status === 'completed' || prev?.status === 'failed') {
          clearInterval(interval)
          return prev
        }
        fetchJob()
        return prev
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [fetchJob])

  // After Stripe redirect, force a fresh poll
  useEffect(() => {
    if (returnedSessionId) fetchJob()
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

  const pageStyle: React.CSSProperties = { minHeight: '100vh', backgroundColor: '#F7F4EF' }
  const wrapStyle: React.CSSProperties = { maxWidth: '600px', margin: '0 auto', padding: '80px 24px 64px' }

  if (fetchError) {
    return (
      <main style={pageStyle}>
        <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: 'rgba(26,26,26,0.6)', fontStyle: 'italic', margin: 0 }}>
            {fetchError}
          </p>
          <button onClick={fetchJob} style={{ fontSize: '0.875rem', color: 'rgba(196,164,164,0.7)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Tentar novamente
          </button>
        </div>
      </main>
    )
  }

  const header = (
    <header style={{ marginBottom: '48px', textAlign: 'center', animation: 'fade-in 0.6s ease-out forwards' }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 300, letterSpacing: '-0.02em', color: '#1A1A1A', margin: 0 }}>
        Karukasi
      </h1>
      <div style={{ margin: '24px auto 0', height: '1px', width: '48px', backgroundColor: 'rgba(196,164,164,0.4)' }} />
    </header>
  )

  if (!job || job.status === 'pending' || job.status === 'processing_preview') {
    return <main style={pageStyle}><div style={wrapStyle}>{header}<ProcessingState /></div></main>
  }

  if (job.status === 'failed') {
    return (
      <main style={pageStyle}>
        <div style={{ ...wrapStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 300, color: 'rgba(26,26,26,0.7)', fontStyle: 'italic', margin: 0 }}>
            Não foi possível gerar o vídeo.
          </p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(26,26,26,0.4)', margin: 0 }}>
            Algo deu errado durante o processamento. Tente novamente com uma foto diferente.
          </p>
          <a href="/" style={{ fontSize: '0.875rem', color: 'rgba(196,164,164,0.7)', textDecoration: 'none' }}>Criar outro vídeo</a>
        </div>
      </main>
    )
  }

  return (
    <main style={pageStyle}>
      <div style={wrapStyle}>
        {header}

        {job.status === 'preview_ready' && !job.paid && job.preview_url && (
          <PreviewPlayer
            previewUrl={job.preview_url}
            jobId={jobId}
            onPaymentClick={handlePaymentClick}
          />
        )}

        {job.status === 'preview_ready' && job.paid && (
          <ProcessingState />
        )}

        {job.status === 'processing_full' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {job.preview_url && (
              <PreviewPlayer previewUrl={job.preview_url} jobId={jobId} onPaymentClick={() => {}} showPaywall={false} />
            )}
            <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'rgba(26,26,26,0.4)', margin: 0 }}>
              Preparando o vídeo completo...
            </p>
          </div>
        )}

        {job.status === 'completed' && job.full_video_url && (
          <FullVideoPlayer videoUrl={job.full_video_url} />
        )}
      </div>
    </main>
  )
}
