export interface Trainer {
  id: number
  name: string
  email: string
  verified: boolean
  joinDate: string
  contentCount: number
  rating: number
}

export const trainers: Trainer[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    verified: false,
    joinDate: "2024-01-15",
    contentCount: 12,
    rating: 4.8
  },
  {
    id: 2,
    name: "Sara Bekele",
    email: "sara.bekele@example.com",
    verified: true,
    joinDate: "2024-01-10",
    contentCount: 25,
    rating: 4.9
  },
  {
    id: 3,
    name: "Michael Johnson",
    email: "michael.j@example.com",
    verified: false,
    joinDate: "2024-02-01",
    contentCount: 8,
    rating: 4.5
  },
  {
    id: 4,
    name: "Alemayehu Tadesse",
    email: "alemu.t@example.com",
    verified: true,
    joinDate: "2024-01-20",
    contentCount: 18,
    rating: 4.7
  },
  {
    id: 5,
    name: "Emily Chen",
    email: "emily.chen@example.com",
    verified: false,
    joinDate: "2024-02-10",
    contentCount: 5,
    rating: 4.3
  }
]

