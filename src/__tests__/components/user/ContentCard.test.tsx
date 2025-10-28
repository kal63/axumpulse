import { render, screen } from '@testing-library/react'
import { ContentCard } from '@/components/user/ContentCard'

const mockContent = {
  id: 1,
  title: 'Test Workout Video',
  description: 'A great workout video',
  type: 'video',
  duration: 1800,
  difficulty: 'intermediate',
  category: 'Strength',
  thumbnailUrl: '/test-thumb.jpg',
  views: 1000,
  likes: 50,
  trainer: {
    id: 1,
    verified: true,
    User: {
      name: 'John Doe',
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





