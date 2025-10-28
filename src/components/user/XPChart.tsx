'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts'
import { NeumorphicCard } from './NeumorphicCard'
import { TrendingUp, Calendar } from 'lucide-react'
import { useState } from 'react'

interface XPChartProps {
  data: Array<{
    date: string
    xp: number
    cumulativeXP: number
    breakdown?: {
      content: number
      challenge: number
      workout: number
    }
  }>
  summary?: {
    totalXP: number
    avgDailyXP: number
    period: number
  }
  onPeriodChange?: (period: number) => void
}

export function XPChart({ data, summary, onPeriodChange }: XPChartProps) {
  const [chartType, setChartType] = useState<'daily' | 'cumulative'>('cumulative')
  const [selectedPeriod, setSelectedPeriod] = useState(30)

  const periods = [
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
  ]

  const handlePeriodChange = (period: number) => {
    setSelectedPeriod(period)
    onPeriodChange?.(period)
  }

  // Format data for display
  const chartData = data.map(item => ({
    ...item,
    displayDate: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-[var(--neumorphic-surface)] p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-[var(--neumorphic-text)] mb-2">
            {new Date(data.date).toLocaleDateString('en-US', { 
              weekday: 'short',
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
          {chartType === 'daily' ? (
            <>
              <p className="text-lg font-bold text-[var(--color-cyber-blue)]">
                +{data.xp} XP
              </p>
              {data.breakdown && (
                <div className="mt-2 space-y-1 text-xs text-[var(--neumorphic-muted)]">
                  {data.breakdown.content > 0 && <div>Content: {data.breakdown.content} XP</div>}
                  {data.breakdown.challenge > 0 && <div>Challenges: {data.breakdown.challenge} XP</div>}
                  {data.breakdown.workout > 0 && <div>Workouts: {data.breakdown.workout} XP</div>}
                </div>
              )}
            </>
          ) : (
            <p className="text-lg font-bold text-[var(--color-neon-magenta)]">
              {data.cumulativeXP.toLocaleString()} XP Total
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <NeumorphicCard>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--neumorphic-text)] flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-[var(--color-cyber-blue)]" />
              XP Progress
            </h2>
            {summary && (
              <div className="mt-2 flex items-center gap-4 text-sm text-[var(--neumorphic-muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Last {summary.period} days
                </span>
                <span>•</span>
                <span>Avg: {summary.avgDailyXP} XP/day</span>
              </div>
            )}
          </div>

          {/* Period Selector */}
          <div className="flex gap-2">
            {periods.map((period) => (
              <button
                key={period.value}
                onClick={() => handlePeriodChange(period.value)}
                className={`
                  px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${selectedPeriod === period.value
                    ? 'bg-gradient-to-r from-[var(--color-cyber-blue)] to-[var(--color-neon-magenta)] text-white'
                    : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-text)] shadow-[2px_2px_4px_rgba(15,23,42,0.15),-2px_-2px_4px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.6),-2px_-2px_4px_rgba(255,255,255,0.06)]'
                  }
                `}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Type Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setChartType('cumulative')}
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition-all
              ${chartType === 'cumulative'
                ? 'bg-gradient-to-r from-[var(--color-neon-magenta)] to-[var(--color-cyber-blue)] text-white'
                : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-muted)] shadow-[2px_2px_4px_rgba(15,23,42,0.15),-2px_-2px_4px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.6),-2px_-2px_4px_rgba(255,255,255,0.06)]'
              }
            `}
          >
            Cumulative XP
          </button>
          <button
            onClick={() => setChartType('daily')}
            className={`
              flex-1 py-2 rounded-lg text-sm font-medium transition-all
              ${chartType === 'daily'
                ? 'bg-gradient-to-r from-[var(--color-neon-magenta)] to-[var(--color-cyber-blue)] text-white'
                : 'bg-[var(--neumorphic-surface)] text-[var(--neumorphic-muted)] shadow-[2px_2px_4px_rgba(15,23,42,0.15),-2px_-2px_4px_rgba(255,255,255,0.85)] dark:shadow-[2px_2px_4px_rgba(0,0,0,0.6),-2px_-2px_4px_rgba(255,255,255,0.06)]'
              }
            `}
          >
            Daily XP
          </button>
        </div>

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-[var(--neumorphic-muted)]">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No XP data available for this period</p>
              <p className="text-sm mt-1">Complete activities to earn XP!</p>
            </div>
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'cumulative' ? (
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-neon-magenta)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-cyber-blue)" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="var(--neumorphic-muted)"
                    tick={{ fill: 'var(--neumorphic-muted)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="var(--neumorphic-muted)"
                    tick={{ fill: 'var(--neumorphic-muted)', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="cumulativeXP" 
                    stroke="var(--color-neon-magenta)" 
                    strokeWidth={3}
                    fill="url(#colorCumulative)" 
                  />
                </AreaChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(156, 163, 175, 0.2)" />
                  <XAxis 
                    dataKey="displayDate" 
                    stroke="var(--neumorphic-muted)"
                    tick={{ fill: 'var(--neumorphic-muted)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="var(--neumorphic-muted)"
                    tick={{ fill: 'var(--neumorphic-muted)', fontSize: 12 }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="var(--color-cyber-blue)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--color-cyber-blue)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Summary Stats */}
        {summary && chartData.length > 0 && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <p className="text-sm text-[var(--neumorphic-muted)]">Total XP</p>
              <p className="text-2xl font-bold text-[var(--neumorphic-text)] mt-1">
                {summary.totalXP.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--neumorphic-muted)]">Daily Avg</p>
              <p className="text-2xl font-bold text-[var(--color-cyber-blue)] mt-1">
                {summary.avgDailyXP}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-[var(--neumorphic-muted)]">Active Days</p>
              <p className="text-2xl font-bold text-[var(--color-neon-magenta)] mt-1">
                {chartData.filter(d => d.xp > 0).length}
              </p>
            </div>
          </div>
        )}
      </div>
    </NeumorphicCard>
  )
}





