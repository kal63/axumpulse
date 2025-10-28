import { WorkoutPlanCard } from './WorkoutPlanCard'
import type { WorkoutPlan } from '@/lib/api-client'

interface WorkoutPlanGridProps {
    plans: WorkoutPlan[]
    onPlanClick: (plan: WorkoutPlan) => void
    showProgress?: boolean
    userProgressMap?: Map<number, {
        status: string
        completedExercises: number
        totalExercises: number
    }>
}

export function WorkoutPlanGrid({ 
    plans, 
    onPlanClick, 
    showProgress = false,
    userProgressMap
}: WorkoutPlanGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
                <WorkoutPlanCard
                    key={plan.id}
                    workoutPlan={plan}
                    onClick={() => onPlanClick(plan)}
                    showProgress={showProgress}
                    userProgress={userProgressMap?.get(plan.id)}
                />
            ))}
        </div>
    )
}


