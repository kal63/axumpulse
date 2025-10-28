export interface Language {
  id: number
  code: 'en' | 'am'
  name: string
  nativeName: string
  isActive: boolean
  contentCount: number
  userCount: number
}

export const languages: Language[] = [
  {
    id: 1,
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isActive: true,
    contentCount: 1250,
    userCount: 8500
  },
  {
    id: 2,
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    isActive: true,
    contentCount: 450,
    userCount: 3200
  }
]

