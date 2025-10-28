import { render, screen } from '@testing-library/react'
import { LeaderboardTable } from '@/components/user/LeaderboardTable'

const mockLeaderboard = [
  {
    rank: 1,
    userId: 1,
    progress: 100,
    status: 'completed',
    joinedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    xpEarned: 500,
    user: {
      id: 1,
      name: 'Alice Winner',
      profilePicture: null
    }
  },
  {
    rank: 2,
    userId: 2,
    progress: 90,
    status: 'active',
    joinedAt: new Date().toISOString(),
    completedAt: null,
    xpEarned: 0,
    user: {
      id: 2,
      name: 'Bob Second',
      profilePicture: null
    }
  },
  {
    rank: 3,
    userId: 3,
    progress: 80,
    status: 'active',
    joinedAt: new Date().toISOString(),
    completedAt: null,
    xpEarned: 0,
    user: {
      id: 3,
      name: 'Charlie Third',
      profilePicture: null
    }
  }
]

describe('LeaderboardTable - Phase 3', () => {
  it('renders leaderboard title', () => {
    render(<LeaderboardTable leaderboard={mockLeaderboard} goalValue={100} />)
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
  })

  it('displays all participants', () => {
    render(<LeaderboardTable leaderboard={mockLeaderboard} goalValue={100} />)
    expect(screen.getByText('Alice Winner')).toBeInTheDocument()
    expect(screen.getByText('Bob Second')).toBeInTheDocument()
    expect(screen.getByText('Charlie Third')).toBeInTheDocument()
  })

  it('shows participant count', () => {
    render(
      <LeaderboardTable 
        leaderboard={mockLeaderboard} 
        totalParticipants={10}
        goalValue={100}
      />
    )
    expect(screen.getByText('10 participants')).toBeInTheDocument()
  })

  it('displays progress for each participant', () => {
    render(<LeaderboardTable leaderboard={mockLeaderboard} goalValue={100} />)
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('90')).toBeInTheDocument()
    expect(screen.getByText('80')).toBeInTheDocument()
  })

  it('shows completion status for completed entries', () => {
    render(<LeaderboardTable leaderboard={mockLeaderboard} goalValue={100} />)
    expect(screen.getByText('Completed')).toBeInTheDocument()
  })

  it('highlights current user', () => {
    const { container } = render(
      <LeaderboardTable 
        leaderboard={mockLeaderboard}
        currentUserId={2}
        goalValue={100}
      />
    )
    expect(screen.getByText('Bob Second (You)')).toBeInTheDocument()
  })

  it('displays user rank when outside top 10', () => {
    render(
      <LeaderboardTable 
        leaderboard={mockLeaderboard}
        currentUserId={99}
        userRank={15}
        goalValue={100}
      />
    )
    expect(screen.getByText('Your Rank')).toBeInTheDocument()
    expect(screen.getByText('#15')).toBeInTheDocument()
  })

  it('shows empty state when no participants', () => {
    render(<LeaderboardTable leaderboard={[]} goalValue={100} />)
    expect(screen.getByText(/No participants yet/i)).toBeInTheDocument()
  })
})





