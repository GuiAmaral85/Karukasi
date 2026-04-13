import '@testing-library/jest-dom'

// Set environment variables for tests
if (!process.env.HEYGEN_API_KEY) {
  process.env.HEYGEN_API_KEY = 'test-api-key'
}

if (typeof window !== 'undefined') {
  window.HTMLMediaElement.prototype.play = () => Promise.resolve()
  window.HTMLMediaElement.prototype.pause = () => {}
  window.HTMLMediaElement.prototype.load = () => {}
}
