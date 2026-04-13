import { render, screen } from '@testing-library/react'
import PreviewPlayer from '@/components/PreviewPlayer'

describe('PreviewPlayer', () => {
  it('renders the video element', () => {
    render(
      <PreviewPlayer
        previewUrl="https://example.com/preview.mp4"
        jobId="test-job-123"
        onPaymentClick={jest.fn()}
      />
    )
    expect(screen.getByTestId('preview-video')).toBeInTheDocument()
  })

  it('renders watermark text', () => {
    render(
      <PreviewPlayer
        previewUrl="https://example.com/preview.mp4"
        jobId="test-job-123"
        onPaymentClick={jest.fn()}
      />
    )
    expect(screen.getByText('karukasi.com')).toBeInTheDocument()
  })

  it('renders paywall overlay with Portuguese copy when showPaywall is true', () => {
    render(
      <PreviewPlayer
        previewUrl="https://example.com/preview.mp4"
        jobId="test-job-123"
        onPaymentClick={jest.fn()}
        showPaywall
      />
    )
    expect(screen.getByText(/este é apenas o início da memória/i)).toBeInTheDocument()
    expect(screen.getByText(/R\$79/)).toBeInTheDocument()
  })

  it('calls onPaymentClick when CTA is clicked', () => {
    const onPaymentClick = jest.fn()
    render(
      <PreviewPlayer
        previewUrl="https://example.com/preview.mp4"
        jobId="test-job-123"
        onPaymentClick={onPaymentClick}
        showPaywall
      />
    )
    screen.getByText(/ver o vídeo completo/i).click()
    expect(onPaymentClick).toHaveBeenCalled()
  })
})
