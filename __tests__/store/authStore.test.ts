import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '@/store/authStore'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

describe('authStore', () => {
  beforeEach(() => {
    // Clear all mocks and reset store state
    jest.clearAllMocks()
    const { result } = renderHook(() => useAuthStore())
    act(() => {
      result.current.logout()
    })
  })

  it('should have initial state with no user and not authenticated', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should login successfully with valid credentials', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      const success = await result.current.login('test@example.com', 'password123')
      expect(success).toBe(true)
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).not.toBeNull()
    expect(result.current.user?.email).toBe('test@example.com')
    expect(result.current.user?.name).toBe('test')
  })

  it('should fail login with empty email', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      const success = await result.current.login('', 'password123')
      expect(success).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should fail login with empty password', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      const success = await result.current.login('test@example.com', '')
      expect(success).toBe(false)
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should logout and clear user data', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // First login
    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })

    expect(result.current.isAuthenticated).toBe(true)

    // Then logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeNull()
  })

  it('should extract name from email correctly', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.login('john.doe@example.com', 'password')
    })

    expect(result.current.user?.name).toBe('john.doe')
  })
})

