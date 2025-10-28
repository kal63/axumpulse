// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            replace: jest.fn(),
            prefetch: jest.fn(),
            back: jest.fn(),
            pathname: '/',
            query: {},
            asPath: '/',
        }
    },
    usePathname() {
        return '/'
    },
    useSearchParams() {
        return new URLSearchParams()
    },
    useParams() {
        return {}
    },
}))

// Mock auth context
jest.mock('@/contexts/auth-context', () => ({
    useAuth: jest.fn(() => ({
        user: null,
        loading: false,
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
    })),
    AuthProvider: ({ children }) => children,
}))

// Mock API client
jest.mock('@/lib/api-client', () => ({
    apiClient: {
        getUserContent: jest.fn(),
        getUserContentById: jest.fn(),
        getUserWorkoutPlans: jest.fn(),
        getUserWorkoutPlanById: jest.fn(),
        getUserChallenges: jest.fn(),
        getUserChallengeById: jest.fn(),
        joinChallenge: jest.fn(),
        updateChallengeProgress: jest.fn(),
        getChallengeLeaderboard: jest.fn(),
        likeContent: jest.fn(),
        saveContent: jest.fn(),
        updateWatchProgress: jest.fn(),
        startWorkoutPlan: jest.fn(),
        completeExercise: jest.fn(),
    },
}))

// Suppress console errors in tests
global.console = {
    ...console,
    error: jest.fn(),
    warn: jest.fn(),
}





