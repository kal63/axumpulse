export interface Challenge {
  id: number
  title: string
  description: string
  type: 'daily' | 'weekly' | 'one-off'
  xpReward: number
  isActive: boolean
  startDate: string
  endDate?: string
  participants: number
  language: 'en' | 'am'
}

export const challenges: Challenge[] = [
  {
    id: 1,
    title: 'Daily 10K Steps',
    description: 'Walk 10,000 steps every day for a week',
    type: 'daily',
    xpReward: 100,
    isActive: true,
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    participants: 1250,
    language: 'en'
  },
  {
    id: 2,
    title: 'Weekly Workout Streak',
    description: 'Complete 5 workouts in a week',
    type: 'weekly',
    xpReward: 500,
    isActive: true,
    startDate: '2024-02-12',
    endDate: '2024-02-18',
    participants: 890,
    language: 'en'
  },
  {
    id: 3,
    title: 'የወር የአካል ብቃት ተግዳሮት',
    description: 'የወር የአካል ብቃት ተግዳሮት ይጠናቀቁ',
    type: 'one-off',
    xpReward: 1000,
    isActive: true,
    startDate: '2024-02-01',
    endDate: '2024-02-29',
    participants: 450,
    language: 'am'
  },
  {
    id: 4,
    title: 'Hydration Challenge',
    description: 'Drink 8 glasses of water daily for 30 days',
    type: 'daily',
    xpReward: 200,
    isActive: false,
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    participants: 2100,
    language: 'en'
  },
  {
    id: 5,
    title: 'Morning Routine Challenge',
    description: 'Complete morning routine for 21 days',
    type: 'one-off',
    xpReward: 750,
    isActive: true,
    startDate: '2024-02-10',
    endDate: '2024-03-02',
    participants: 680,
    language: 'en'
  }
]

