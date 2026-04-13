'use client'

import { useState, useCallback, DragEvent, ChangeEvent } from 'react'

interface Props {
  onFileSelect: (file: File) => void
}

export default function PhotoUploadZone({ onFileSelect }: Props) {
  const [filename, setFilename] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const validate = (file: File): string | null => {
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return 'Use um arquivo JPG ou PNG.'
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'A foto deve ter no máximo 10 MB.'
    }
    return null
  }

  const handleFile = useCallback((file: File) => {
    const validationError = validate(file)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
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

  return (
    <div className="space-y-2">
      <label
        className={[
          'block w-full cursor-pointer rounded-sm border border-dashed p-10 text-center',
          'transition-all duration-300',
          isDragging
            ? 'border-[#C4A4A4] bg-[#C4A4A4]/5'
            : 'border-[#1A1A1A]/20 hover:border-[#C4A4A4]',
        ].join(' ')}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          data-testid="photo-input"
          type="file"
          className="sr-only"
          onChange={handleChange}
        />
        {filename ? (
          <div className="space-y-1">
            <p className="text-lg text-[#1A1A1A]/80 italic" style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}>{filename}</p>
            <p className="text-sm text-[#1A1A1A]/40">Clique para substituir</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xl text-[#1A1A1A]/70" style={{ fontFamily: 'var(--font-display, Georgia, serif)' }}>
              Foto do ente querido
            </p>
            <p className="text-sm text-[#1A1A1A]/40">
              Arraste ou clique — JPG ou PNG, até 10 MB
            </p>
            <p className="text-xs text-[#1A1A1A]/30 mt-2">
              Para melhores resultados, use uma foto com o rosto visível.
            </p>
          </div>
        )}
      </label>

      {error && (
        <p className="text-sm text-[#C4A4A4]/80" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
