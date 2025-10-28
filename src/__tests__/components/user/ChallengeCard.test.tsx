import { render, screen } from '@testing-library/react'
import { ChallengeCard } from '@/components/user/ChallengeCard'

const mockChallenge = {
  id: 1,
  title: '100 Push-ups Challenge',
  description: 'Complete 100 push-ups in 7 days',
  difficulty: 'intermediate',
  category: 'Strength',
  goalType: 'push-ups',
  goalValue: 100,
  startDate: new Date().toISOString(),
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  xpReward: 500,
  trainer: {
    id: 1,
    verified: true,
    User: {
      name: 'Mike Johnson',
      profilePicture: null
    }
  }
}

const mockChallengeWithProgress = {
  ...mockChallenge,
  userProgress: [{
    status: 'active',
    progress: 50,
    joinedAt: new Date().toISOString(),
    completedAt: null,
    rank: 5
  }]
}

describe('ChallengeCard - Phase 3', () => {
  it('renders challenge title', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText('100 Push-ups Challenge')).toBeInTheDocument()
  })

  it('displays trainer name with verification', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText(/Mike Johnson/)).toBeInTheDocument()
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('shows goal value and type', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText(/100 push-ups/i)).toBeInTheDocument()
  })

  it('displays XP reward', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText(/500 XP/i)).toBeInTheDocument()
  })

  it('shows difficulty badge', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText(/intermediate/i)).toBeInTheDocument()
  })

  it('displays "Join Challenge" when not joined', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText('Join Challenge')).toBeInTheDocument()
  })

  it('shows progress bar when user has joined', () => {
    render(<ChallengeCard challenge={mockChallengeWithProgress} />)
    expect(screen.getByText('Your Progress')).toBeInTheDocument()
    expect(screen.getByText(/50\/100/)).toBeInTheDocument()
  })

  it('displays user rank when available', () => {
    render(<ChallengeCard challenge={mockChallengeWithProgress} />)
    expect(screen.getByText(/Rank #5/)).toBeInTheDocument()
  })

  it('shows Active status badge for active challenges', () => {
    render(<ChallengeCard challenge={mockChallenge} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('does not show progress when showProgress is false', () => {
    render(<ChallengeCard challenge={mockChallengeWithProgress} showProgress={false} />)
    expect(screen.queryByText('Your Progress')).not.toBeInTheDocument()
  })
})





