import '@testing-library/jest-dom'

// Set environment variables for tests
if (!process.env.HEYGEN_API_KEY) {
  process.env.HEYGEN_API_KEY = 'test-api-key'
}

if (!process.env.STRIPE_SECRET_KEY) {
  process.env.STRIPE_SECRET_KEY = 'sk_test_fake'
}

if (!process.env.STRIPE_PRICE_ID) {
  process.env.STRIPE_PRICE_ID = 'price_test_fake'
}

if (typeof window !== 'undefined') {
  window.HTMLMediaElement.prototype.play = () => Promise.resolve()
  window.HTMLMediaElement.prototype.pause = () => {}
  window.HTMLMediaElement.prototype.load = () => {}
}
