'use client'

import { useState, useCallback, DragEvent, ChangeEvent } from 'react'

interface Props {
  onFileSelect: (file: File | null) => void
}

export default function AudioUploadZone({ onFileSelect }: Props) {
  const [filename, setFilename] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const validate = (file: File): boolean => {
    if (!['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/x-wav'].includes(file.type)) {
      setError('Use um arquivo MP3 ou WAV para a voz.')
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('O arquivo de voz deve ter no máximo 5 MB.')
      return false
    }
    return true
  }

  const handleFile = useCallback((file: File) => {
    setError(null)
    if (!validate(file)) return
    setFilename(file.name)
    onFileSelect(file)
  }, [onFileSelect])

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleRemove = () => {
    setFilename(null)
    setError(null)
    onFileSelect(null)
  }

  return (
    <div className="space-y-2">
      {filename ? (
        <div className="flex items-center justify-between border border-[#C4A4A4]/30 rounded-sm px-4 py-3">
          <div>
            <p className="italic text-[#1A1A1A]/80" style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}>{filename}</p>
            <p className="text-xs text-[#1A1A1A]/40">Gravação de referência adicionada</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="text-xs text-[#1A1A1A]/30 hover:text-[#1A1A1A]/60 transition-colors"
          >
            Remover
          </button>
        </div>
      ) : (
        <label
          className={[
            'block w-full cursor-pointer rounded-sm border border-dashed p-8 text-center',
            'transition-all duration-300',
            isDragging
              ? 'border-[#C4A4A4] bg-[#C4A4A4]/5'
              : 'border-[#1A1A1A]/15 hover:border-[#C4A4A4]/50',
          ].join(' ')}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            data-testid="audio-input"
            type="file"
            accept="audio/mpeg,audio/wav,audio/mp3"
            className="sr-only"
            onChange={handleChange}
          />
          <div className="space-y-1">
            <p className="text-lg text-[#1A1A1A]/60 italic" style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}>
              Gravação de referência
            </p>
            <p className="text-sm text-[#1A1A1A]/35">
              Arraste ou clique — MP3 ou WAV, até 5 MB
            </p>
          </div>
        </label>
      )}

      {error && (
        <p className="text-sm text-[#C4A4A4]/80" role="alert">{error}</p>
      )}
    </div>
  )
}
