import { render, screen } from '@testing-library/react'
import { ContentCard } from '@/components/user/ContentCard'

const mockContent = {
  id: 1,
  trainerId: 1,
  title: 'Test Workout Video',
  description: 'A great workout video',
  type: 'video' as const,
  duration: 1800,
  difficulty: 'intermediate' as const,
  category: 'strength' as const,
  thumbnailUrl: '/test-thumb.jpg',
  views: 1000,
  likes: 50,
  tags: [],
  status: 'approved' as const,
  isPublic: true,
  isFeatured: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  trainer: {
    userId: 1,
    verified: true,
    User: {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      profilePicture: '/profile.jpg'
    }
  }
}

describe('ContentCard - Phase 1B', () => {
  it('renders content title', () => {
    render(<ContentCard content={mockContent} />)
    expect(screen.getByText('Test Workout Video')).toBeInTheDocument()
  })

  it('displays trainer name', () => {
    render(<ContentCard content={mockContent} />)
    expect(screen.getByText(/John Doe/)).toBeInTheDocument()
  })

  it('shows difficulty badge', () => {
    render(<ContentCard content={mockContent} />)
    expect(screen.getByText(/intermediate/i)).toBeInTheDocument()
  })

  it('displays duration formatted correctly', () => {
    render(<ContentCard content={mockContent} />)
    expect(screen.getByText('30 min')).toBeInTheDocument()
  })

  it('shows category', () => {
    render(<ContentCard content={mockContent} />)
    expect(screen.getByText('Strength')).toBeInTheDocument()
  })

  it('displays view count', () => {
    render(<ContentCard content={mockContent} />)
    expect(screen.getByText(/1,000/)).toBeInTheDocument()
  })

  it('shows verified badge for verified trainers', () => {
    render(<ContentCard content={mockContent} />)
    expect(screen.getByText('✓')).toBeInTheDocument()
  })
})





