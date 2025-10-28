export interface ContentItem {
  id: number
  kind: 'workout' | 'article'
  title: string
  author: string
  authorId: number
  status: 'pending' | 'approved' | 'rejected'
  submittedDate: string
  description: string
  language: 'en' | 'am'
}

export const pendingContent: ContentItem[] = [
  {
    id: 1,
    kind: 'workout',
    title: 'Morning Yoga Flow',
    author: 'Sara Bekele',
    authorId: 2,
    status: 'pending',
    submittedDate: '2024-02-14',
    description: 'A gentle 20-minute yoga routine perfect for starting your day',
    language: 'en'
  },
  {
    id: 2,
    kind: 'article',
    title: 'Nutrition Tips for Athletes',
    author: 'John Doe',
    authorId: 1,
    status: 'pending',
    submittedDate: '2024-02-13',
    description: 'Essential nutrition guidelines for fitness enthusiasts',
    language: 'en'
  },
  {
    id: 3,
    kind: 'workout',
    title: 'የቀን የአካል ብቃት ልምምድ',
    author: 'Alemayehu Tadesse',
    authorId: 4,
    status: 'pending',
    submittedDate: '2024-02-12',
    description: 'የቀን የአካል ብቃት ልምምድ ለጀማሪዎች',
    language: 'am'
  },
  {
    id: 4,
    kind: 'article',
    title: 'Mental Health and Fitness',
    author: 'Emily Chen',
    authorId: 5,
    status: 'pending',
    submittedDate: '2024-02-11',
    description: 'How physical exercise impacts mental wellbeing',
    language: 'en'
  },
  {
    id: 5,
    kind: 'workout',
    title: 'High Intensity Interval Training',
    author: 'Michael Johnson',
    authorId: 3,
    status: 'pending',
    submittedDate: '2024-02-10',
    description: '30-minute HIIT workout for maximum calorie burn',
    language: 'en'
  }
]

