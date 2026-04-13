import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PhotoUploadZone from '@/components/PhotoUploadZone'

describe('PhotoUploadZone', () => {
  it('renders the upload prompt in Portuguese', () => {
    render(<PhotoUploadZone onFileSelect={jest.fn()} />)
    expect(screen.getByText(/foto do ente querido/i)).toBeInTheDocument()
  })

  it('calls onFileSelect with a valid JPG file', async () => {
    const onFileSelect = jest.fn()
    render(<PhotoUploadZone onFileSelect={onFileSelect} />)

    const file = new File(['(image data)'], 'photo.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('photo-input')
    await userEvent.upload(input, file)

    expect(onFileSelect).toHaveBeenCalledWith(file)
  })

  it('shows an error for non-image files', async () => {
    render(<PhotoUploadZone onFileSelect={jest.fn()} />)

    const file = new File(['data'], 'document.pdf', { type: 'application/pdf' })
    const input = screen.getByTestId('photo-input')
    await userEvent.upload(input, file)

    expect(screen.getByText(/use um arquivo jpg ou png/i)).toBeInTheDocument()
  })

  it('shows selected filename after valid upload', async () => {
    render(<PhotoUploadZone onFileSelect={jest.fn()} />)

    const file = new File(['(image data)'], 'memoria.jpg', { type: 'image/jpeg' })
    const input = screen.getByTestId('photo-input')
    await userEvent.upload(input, file)

    expect(screen.getByText(/memoria\.jpg/i)).toBeInTheDocument()
  })
})
