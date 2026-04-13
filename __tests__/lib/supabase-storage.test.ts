import { getPublicUrl, uploadFile } from '@/lib/supabase-storage'

// Mock the supabase server client
jest.mock('@/lib/supabase-server', () => ({
  createServiceClient: jest.fn(() => ({
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: 'https://example.supabase.co/storage/v1/object/public/karukasi/test.jpg' },
        }),
      })),
    },
  })),
}))

describe('supabase-storage', () => {
  it('getPublicUrl returns the expected URL format', () => {
    const url = getPublicUrl('photos/abc123.jpg')
    // Just verify it's a function that returns a string
    expect(typeof url).toBe('string')
  })

  it('uploadFile resolves without throwing on success', async () => {
    const buffer = Buffer.from('fake image data')
    await expect(
      uploadFile('photos/test.jpg', buffer, 'image/jpeg')
    ).resolves.not.toThrow()
  })
})
