export interface Reward {
  id: number
  name: string
  description: string
  xpCost: number
  category: 'fitness' | 'nutrition' | 'wellness' | 'achievement'
  isActive: boolean
  stock: number
  redeemed: number
  language: 'en' | 'am'
}

export const rewards: Reward[] = [
  {
    id: 1,
    name: 'Premium Workout Plan',
    description: 'Access to exclusive workout routines',
    xpCost: 500,
    category: 'fitness',
    isActive: true,
    stock: 100,
    redeemed: 25,
    language: 'en'
  },
  {
    id: 2,
    name: 'Nutrition Consultation',
    description: 'One-on-one nutrition advice session',
    xpCost: 1000,
    category: 'nutrition',
    isActive: true,
    stock: 50,
    redeemed: 12,
    language: 'en'
  },
  {
    id: 3,
    name: 'የአካል ብቃት መማሪያ መጽሐፍ',
    description: 'የአካል ብቃት መማሪያ መጽሐፍ በአማርኛ',
    xpCost: 300,
    category: 'fitness',
    isActive: true,
    stock: 200,
    redeemed: 45,
    language: 'am'
  },
  {
    id: 4,
    name: 'Meditation App Premium',
    description: '3-month premium subscription to meditation app',
    xpCost: 750,
    category: 'wellness',
    isActive: true,
    stock: 75,
    redeemed: 18,
    language: 'en'
  },
  {
    id: 5,
    name: 'Achievement Badge',
    description: 'Special badge for completing 10 challenges',
    xpCost: 200,
    category: 'achievement',
    isActive: true,
    stock: 500,
    redeemed: 120,
    language: 'en'
  },
  {
    id: 6,
    name: 'Fitness Tracker',
    description: 'Digital fitness tracking device',
    xpCost: 2000,
    category: 'fitness',
    isActive: false,
    stock: 0,
    redeemed: 10,
    language: 'en'
  }
]

