'use client'

import { useState } from 'react'
import { VOICE_PRESETS, VoiceGender, VoiceAge } from '@/types'

interface Props {
  onChange: (voiceId: string) => void
}

const GENDERS: { value: VoiceGender; label: string }[] = [
  { value: 'feminino', label: 'Feminino' },
  { value: 'masculino', label: 'Masculino' },
]

const AGES: { value: VoiceAge; label: string }[] = [
  { value: 'jovem', label: 'Jovem' },
  { value: 'adulto', label: 'Adulto' },
  { value: 'idoso', label: 'Idoso' },
]

export default function VoiceSelector({ onChange }: Props) {
  const [gender, setGender] = useState<VoiceGender | null>(null)
  const [age, setAge] = useState<VoiceAge | null>(null)

  const handleSelect = (newGender: VoiceGender | null, newAge: VoiceAge | null) => {
    const g = newGender ?? gender
    const a = newAge ?? age
    if (g && a) {
      const key = `${g}_${a}` as keyof typeof VOICE_PRESETS
      const preset = VOICE_PRESETS[key]
      onChange(preset.voice_id)
    }
  }

  const optionClass = (selected: boolean) =>
    [
      'px-4 py-2 text-sm border cursor-pointer transition-all duration-200 rounded-sm',
      selected
        ? 'border-[#C4A4A4] bg-[#C4A4A4]/10 text-[#1A1A1A]'
        : 'border-[#1A1A1A]/15 text-[#1A1A1A]/50 hover:border-[#C4A4A4]/50',
    ].join(' ')

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#1A1A1A]/50">Escolha a voz que mais se aproxima</p>

      <div>
        <p className="text-xs text-[#1A1A1A]/40 mb-2 uppercase tracking-widest">Gênero</p>
        <div className="flex gap-3">
          {GENDERS.map(({ value, label }) => (
            <label key={value} className={optionClass(gender === value)}>
              <input
                type="radio"
                name="gender"
                value={value}
                aria-label={label}
                className="sr-only"
                onChange={() => {
                  setGender(value)
                  handleSelect(value, null)
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-[#1A1A1A]/40 mb-2 uppercase tracking-widest">Faixa etária</p>
        <div className="flex gap-3">
          {AGES.map(({ value, label }) => (
            <label key={value} className={optionClass(age === value)}>
              <input
                type="radio"
                name="age"
                value={value}
                aria-label={label}
                className="sr-only"
                onChange={() => {
                  setAge(value)
                  handleSelect(null, value)
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
