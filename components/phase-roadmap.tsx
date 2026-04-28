'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Lock, MapPin, Trophy, Star, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Phase {
  id: number
  name: string
  color: string
}

interface PhaseRoadmapProps {
  phases: Phase[]
  currentPhase: number
  completedPhases: number[]
  onPhaseSelect: (phaseId: number) => void
  isPassed: boolean
  onGenerateCertificate?: () => void
}

export function PhaseRoadmap({
  phases,
  currentPhase,
  completedPhases,
  onPhaseSelect,
  isPassed,
  onGenerateCertificate,
}: PhaseRoadmapProps) {
  const getPhaseStatus = (phaseId: number) => {
    if (completedPhases.includes(phaseId)) return 'completed'
    if (phaseId === currentPhase && isPassed) return 'current-passed'
    if (phaseId === currentPhase) return 'current-failed'
    if (phaseId === 1 && currentPhase === 0) return 'next'
    if (phaseId === currentPhase + 1 && isPassed) return 'next'
    return 'locked'
  }

  const getPhaseColor = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
      green: {
        bg: 'bg-emerald-500',
        border: 'border-emerald-500',
        text: 'text-emerald-500',
        glow: 'shadow-emerald-500/50',
      },
      blue: {
        bg: 'bg-blue-500',
        border: 'border-blue-500',
        text: 'text-blue-500',
        glow: 'shadow-blue-500/50',
      },
      cyan: {
        bg: 'bg-cyan-500',
        border: 'border-cyan-500',
        text: 'text-cyan-500',
        glow: 'shadow-cyan-500/50',
      },
      yellow: {
        bg: 'bg-yellow-500',
        border: 'border-yellow-500',
        text: 'text-yellow-500',
        glow: 'shadow-yellow-500/50',
      },
      red: {
        bg: 'bg-red-500',
        border: 'border-red-500',
        text: 'text-red-500',
        glow: 'shadow-red-500/50',
      },
      purple: {
        bg: 'bg-purple-500',
        border: 'border-purple-500',
        text: 'text-purple-500',
        glow: 'shadow-purple-500/50',
      },
    }
    return colorMap[color] || colorMap.green
  }

  const getPhasePosition = (index: number) => {
    const positions = [
      { x: '20%', y: '12%' },
      { x: '50%', y: '25%' },
      { x: '80%', y: '25%' },
      { x: '70%', y: '50%' },
      { x: '35%', y: '65%' },
      { x: '50%', y: '85%' },
    ]
    return positions[index] || positions[0]
  }

  const isLastPhase = currentPhase === phases.length

  const pathPoints = phases.map((_, index) => getPhasePosition(index))
  const pathD = pathPoints.map((point, index) => {
    const x = parseFloat(point.x)
    const y = parseFloat(point.y)
    if (index === 0) return `M ${x} ${y}`
    
    const prevPoint = pathPoints[index - 1]
    const prevX = parseFloat(prevPoint.x)
    const prevY = parseFloat(prevPoint.y)
    
    const controlX = (prevX + x) / 2
    const controlY = (prevY + y) / 2 + (Math.random() - 0.5) * 10
    
    return `Q ${controlX} ${controlY} ${x} ${y}`
  }).join(' ')

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      <div className="relative w-full bg-slate-100 rounded-3xl p-4 md:p-8 border-2 border-border min-h-[500px] md:min-h-[700px] overflow-hidden">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
          {phases.map((phase, index) => {
            if (index === 0) return null
            
            const prevPoint = getPhasePosition(index - 1)
            const currPoint = getPhasePosition(index)
            
            const prevX = parseFloat(prevPoint.x)
            const prevY = parseFloat(prevPoint.y)
            const currX = parseFloat(currPoint.x)
            const currY = parseFloat(currPoint.y)
            
            const prevStatus = getPhaseStatus(phases[index - 1].id)
            const isPathCompleted = prevStatus === 'completed' || prevStatus === 'current-passed'
            
            if (!isPathCompleted) return null
            
            return (
              <line
                key={`path-${index}`}
                x1={`${prevX}%`}
                y1={`${prevY}%`}
                x2={`${currX}%`}
                y2={`${currY}%`}
                stroke="currentColor"
                strokeWidth="3"
                className="text-border"
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.id)
          const colors = getPhaseColor(phase.color)
          const isCompleted = status === 'completed'
          const isCurrent = status === 'current-passed' || status === 'current-failed'
          const isNext = status === 'next'
          const isLocked = status === 'locked'
          const isClickable = (isNext || (isCurrent && isPassed) || (phase.id === 1 && currentPhase === 0)) && !isLastPhase
          const position = getPhasePosition(index)

          return (
            <div
              key={phase.id}
              className="absolute transition-all duration-500 group"
              style={{
                left: position.x,
                top: position.y,
                transform: 'translate(-50%, -50%)',
                zIndex: isCurrent || isNext ? 20 : 10,
              }}
            >
              {isNext && (
                <div className="absolute inset-0 -z-10">
                  <div className={cn(
                    'absolute inset-0 rounded-full animate-ping',
                    'bg-primary',
                    'opacity-20'
                  )} style={{ width: '60px', height: '60px', left: '-5px', top: '-5px' }} />
                </div>
              )}

              <div
                className={cn(
                  'relative w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background',
                  isCompleted && `${colors.bg} ${colors.border} shadow-xl ${colors.glow}`,
                  isCurrent && isPassed && `${colors.bg} ${colors.border} shadow-xl ${colors.glow}`,
                  isCurrent && !isPassed && 'bg-red-500 border-red-500 shadow-xl shadow-red-500/50',
                  isNext && 'bg-primary border-primary shadow-2xl shadow-primary/50 md:scale-110 cursor-pointer',
                  isLocked && 'bg-muted border-muted-foreground opacity-50',
                  isClickable && 'cursor-pointer'
                )}
                onClick={() => isClickable && onPhaseSelect(phase.id)}
              >
                <span className={cn(
                  'text-lg md:text-2xl font-bold drop-shadow-lg',
                  (isCompleted || isCurrent || isNext) && 'text-white',
                  isLocked && 'text-muted-foreground'
                )}>
                  {phase.id}
                </span>
              </div>

              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 text-center whitespace-nowrap">
                {(isCompleted || isCurrent) && (
                  <Check className="w-6 h-6 md:w-5 md:h-5 text-green-500 mx-auto" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {isLastPhase && isPassed && (
        <div className="mt-8 text-center">
          <Card className="p-8 border-yellow-500 bg-yellow-500/5">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-2xl font-bold mb-2">Jornada Completa!</h3>
            <p className="text-muted-foreground mb-4">
              Parabéns! Você conquistou todas as fases!
            </p>
            {onGenerateCertificate && (
              <Button
                onClick={onGenerateCertificate}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:opacity-90 text-white font-bold h-14 px-8 text-lg shadow-lg"
              >
                Gerar Certificado
              </Button>
            )}
          </Card>
        </div>
      )}
    </div>
  )
}
