import { render, screen } from '@testing-library/react'
import { WorkoutPlanCard } from '@/components/user/WorkoutPlanCard'

const mockWorkoutPlan = {
  id: 1,
  trainerId: 1,
  title: '30-Day Fitness Challenge',
  description: 'Get fit in 30 days',
  difficulty: 'beginner' as const,
  category: 'Full Body',
  tags: [],
  isPublic: true,
  status: 'approved' as const,
  estimatedDuration: 30,
  totalExercises: 3,
  exercises: [
    { 
      id: 1, 
      workoutPlanId: 1,
      name: 'Push-ups',
      muscleGroups: [],
      order: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    { 
      id: 2, 
      workoutPlanId: 1,
      name: 'Squats',
      muscleGroups: [],
      order: 2,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    { 
      id: 3, 
      workoutPlanId: 1,
      name: 'Plank',
      muscleGroups: [],
      order: 3,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  trainer: {
    id: 1,
    name: 'Jane Smith',
    email: 'jane@example.com',
    profilePicture: null
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





