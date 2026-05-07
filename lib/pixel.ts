/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window { fbq?: (...args: any[]) => void }
}

export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', event, params)
  }
}
