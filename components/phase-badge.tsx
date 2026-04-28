import { getPhaseColorClass } from "@/lib/game-logic"

interface PhaseBadgeProps {
  phaseNumber: number
  phaseName: string
  phaseColor: string
}

export function PhaseBadge({ phaseNumber, phaseName, phaseColor }: PhaseBadgeProps) {
  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`flex flex-col w-16 h-16 rounded-2xl text-white bg-gradient-to-br ${getPhaseColorClass(phaseColor)} flex items-center justify-center shadow-lg`}
      >
        <p className="text-xs font-medium">Fase</p>
        <span className="text-2xl font-bold">{phaseNumber}</span>
      </div>
    </div>
  )
}
