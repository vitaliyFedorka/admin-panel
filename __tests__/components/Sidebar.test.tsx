import { render, screen } from '@testing-library/react'
import Sidebar from '@/components/Sidebar'

const mockUseAuthStore = jest.fn()
const mockLogout = jest.fn()

// Mock the auth store
jest.mock('@/store/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}))

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('Sidebar', () => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAuthStore.mockReturnValue({
      user: mockUser,
      logout: mockLogout,
    })
  })

  it('should render sidebar with title', () => {
    render(<Sidebar />)
    expect(screen.getByText('Admin Panel')).toBeInTheDocument()
  })

  it('should render user email when user is logged in', () => {
    render(<Sidebar />)
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })

  it('should render all navigation links', () => {
    render(<Sidebar />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Users')).toBeInTheDocument()
    expect(screen.getByText('Posts')).toBeInTheDocument()
    expect(screen.getByText('Todos')).toBeInTheDocument()
  })

  it('should render logout button', () => {
    render(<Sidebar />)
    expect(screen.getByText('Logout')).toBeInTheDocument()
  })

  it('should not render user email when user is not logged in', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      logout: mockLogout,
    })
    
    render(<Sidebar />)
    expect(screen.queryByText('test@example.com')).not.toBeInTheDocument()
  })
})

