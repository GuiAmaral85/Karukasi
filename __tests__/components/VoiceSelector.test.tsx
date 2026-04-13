import { render, screen, fireEvent } from '@testing-library/react'
import VoiceSelector from '@/components/VoiceSelector'

describe('VoiceSelector', () => {
  it('renders gender options in Portuguese', () => {
    render(<VoiceSelector onChange={jest.fn()} />)
    expect(screen.getByText('Feminino')).toBeInTheDocument()
    expect(screen.getByText('Masculino')).toBeInTheDocument()
  })

  it('renders age range options', () => {
    render(<VoiceSelector onChange={jest.fn()} />)
    expect(screen.getByText('Jovem')).toBeInTheDocument()
    expect(screen.getByText('Adulto')).toBeInTheDocument()
    expect(screen.getByText('Idoso')).toBeInTheDocument()
  })

  it('calls onChange with correct voice_id when selections change', () => {
    const onChange = jest.fn()
    render(<VoiceSelector onChange={onChange} />)

    fireEvent.click(screen.getByLabelText('Feminino'))
    fireEvent.click(screen.getByLabelText('Jovem'))

    // feminino_jovem → Rachel → 21m00Tcm4TlvDq8ikWAM
    expect(onChange).toHaveBeenLastCalledWith('21m00Tcm4TlvDq8ikWAM')
  })
})
