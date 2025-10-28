export interface User {
  id: number
  name: string
  email: string
  phone: string
  role: 'user' | 'admin' | 'blocked'
  joinDate: string
  lastActive: string
  xp: number
  challengesCompleted: number
}

export const users: User[] = [
  {
    id: 1,
    name: "Ahmed Hassan",
    email: "ahmed.h@example.com",
    phone: "+251911234567",
    role: 'user',
    joinDate: "2024-01-15",
    lastActive: "2024-02-15",
    xp: 1250,
    challengesCompleted: 8
  },
  {
    id: 2,
    name: "Fatima Ali",
    email: "fatima.ali@example.com",
    phone: "+251922345678",
    role: 'user',
    joinDate: "2024-01-20",
    lastActive: "2024-02-14",
    xp: 890,
    challengesCompleted: 5
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@axumpulse.com",
    phone: "+251933456789",
    role: 'admin',
    joinDate: "2024-01-01",
    lastActive: "2024-02-15",
    xp: 0,
    challengesCompleted: 0
  },
  {
    id: 4,
    name: "Blocked User",
    email: "blocked@example.com",
    phone: "+251944567890",
    role: 'blocked',
    joinDate: "2024-01-25",
    lastActive: "2024-02-10",
    xp: 450,
    challengesCompleted: 2
  },
  {
    id: 5,
    name: "Meron Tekle",
    email: "meron.t@example.com",
    phone: "+251955678901",
    role: 'user',
    joinDate: "2024-02-01",
    lastActive: "2024-02-15",
    xp: 2100,
    challengesCompleted: 12
  }
]

