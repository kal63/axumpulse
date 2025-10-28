import { render, screen } from '@testing-library/react'
import { WorkoutPlanCard } from '@/components/user/WorkoutPlanCard'

const mockWorkoutPlan = {
  id: 1,
  title: '30-Day Fitness Challenge',
  description: 'Get fit in 30 days',
  difficulty: 'beginner',
  category: 'Full Body',
  duration: 30,
  exercises: [
    { id: 1, name: 'Push-ups' },
    { id: 2, name: 'Squats' },
    { id: 3, name: 'Plank' }
  ],
  trainer: {
    id: 1,
    verified: true,
    User: {
      name: 'Jane Smith',
      profilePicture: null
    }
  }
}

describe('WorkoutPlanCard - Phase 2', () => {
  it('renders workout plan title', () => {
    render(<WorkoutPlanCard workoutPlan={mockWorkoutPlan} />)
    expect(screen.getByText('30-Day Fitness Challenge')).toBeInTheDocument()
  })

  it('displays trainer name', () => {
    render(<WorkoutPlanCard workoutPlan={mockWorkoutPlan} />)
    expect(screen.getByText(/Jane Smith/)).toBeInTheDocument()
  })

  it('shows exercise count', () => {
    render(<WorkoutPlanCard workoutPlan={mockWorkoutPlan} />)
    expect(screen.getByText(/3 exercises/i)).toBeInTheDocument()
  })

  it('displays duration in days', () => {
    render(<WorkoutPlanCard workoutPlan={mockWorkoutPlan} />)
    expect(screen.getByText(/30 days/i)).toBeInTheDocument()
  })

  it('shows difficulty level', () => {
    render(<WorkoutPlanCard workoutPlan={mockWorkoutPlan} />)
    expect(screen.getByText(/beginner/i)).toBeInTheDocument()
  })

  it('displays category', () => {
    render(<WorkoutPlanCard workoutPlan={mockWorkoutPlan} />)
    expect(screen.getByText('Full Body')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<WorkoutPlanCard workoutPlan={mockWorkoutPlan} />)
    expect(screen.getByText('Get fit in 30 days')).toBeInTheDocument()
  })
})





