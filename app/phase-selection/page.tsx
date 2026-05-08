'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getProgress, saveProgress, clearProgress, type GameProgress } from '@/lib/game-storage'
import questionsData from '@/data/questions.json'
import type { GameData } from '@/lib/game-logic'

interface PhaseState {
  id: number
  name: string
  color: string
  status: 'locked' | 'available' | 'completed' | 'failed'
  score?: number
}

interface RoadPoint {
  x: number
  y: number
  type: 'mission' | 'phase'
  phaseIndex: number
  missionIndex?: number
}

interface BoundaryPoint {
  x: number
  y: number
}

interface TerritoryRegion {
  phaseIndex: number
  color: string
  fillOpacity: number
  path: string
}

type MissionState = 'locked' | 'current' | 'correct' | 'wrong' | 'available'

const colorMap: Record<string, string> = {
  green: '#10B981',
  blue: '#3B82F6',
  yellow: '#F59E0B',
  red: '#EF4444',
  purple: '#8B5CF6',
  brown: '#542e03',
}

const phaseStatusLabel: Record<PhaseState['status'], string> = {
  locked: 'Bloqueada',
  available: 'Disponível',
  completed: 'Concluída',
  failed: 'Refazer',
}

const getPhaseTitle = (phaseName: string) => {
  const sanitizedTitle = phaseName
    .replace(/^Fase\s+\d+\s*[^A-Za-z0-9]+\s*/i, '')
    .trim()

  return sanitizedTitle || phaseName
}

const clampValue = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export default function PhaseSelectionPage() {
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [phases, setPhases] = useState<PhaseState[]>([])
  const [savedProgress, setSavedProgress] = useState<GameProgress | null>(null)
  const gameData = questionsData as GameData
  const totalPhases = gameData.phases.length

  useEffect(() => {
    initializePhases()
  }, [])

  const initializePhases = () => {
    let progress = getProgress()

    if (progress) {
      const isProgressValid =
        progress.currentPhase >= 0 &&
        progress.currentPhase < gameData.phases.length &&
        Array.isArray(progress.allPhaseScores) &&
        Array.isArray(progress.phaseAnswers) &&
        Array.isArray(progress.allPhaseAnswers)

      if (!isProgressValid) {
        clearProgress()
        progress = null
      }
    }

    const phasesState: PhaseState[] = gameData.phases.map((phase, index) => {
      let status: PhaseState['status'] = 'locked'
      let score: number | undefined

      if (index === 0) {
        status = 'available'
      }

      if (progress) {
        if (progress.allPhaseScores[index] !== undefined) {
          score = progress.allPhaseScores[index]
          status = score >= 60 ? 'completed' : 'failed'
        } else if (
          progress.currentPhase === index ||
          (index > 0 && (progress.allPhaseScores[index - 1] ?? -1) >= 60)
        ) {
          status = 'available'
        }
      }

      return {
        id: phase.id,
        name: phase.name,
        color: phase.color,
        status,
        score,
      }
    })

    setSavedProgress(progress)
    setPhases(phasesState)
  }

  const hasCompletedJourney = (progress: GameProgress | null = savedProgress) =>
    !!progress &&
    gameData.phases.every((_, index) => (progress.allPhaseScores?.[index] ?? -1) >= 60)

  const getPhaseColor = (phase: PhaseState) => {
    switch (phase.status) {
      case 'locked':
        return '#94A3B8'
      case 'completed':
        return '#10B981'
      case 'failed':
        return '#EF4444'
      case 'available':
      default:
        return colorMap[phase.color] || colorMap.green
    }
  }

  const canPlayMission = (phaseIndex: number, missionIndex: number) => {
    const phase = phases[phaseIndex]
    if (!phase || phase.status === 'locked') return false

    if (getMissionAnswer(phaseIndex, missionIndex) !== undefined) return false

    if (phase.status === 'completed' || phase.status === 'failed') {
      return false
    }

    if (!savedProgress) {
      return phaseIndex === 0 && missionIndex === 0
    }

    if (savedProgress.currentPhase === phaseIndex) {
      const answeredCount = savedProgress.phaseAnswers?.filter((answer) => answer !== undefined).length ?? 0
      return missionIndex === answeredCount
    }

    return phase.status === 'available' && missionIndex === 0
  }

  const isMissionCurrent = (phaseIndex: number, missionIndex: number) => {
    const phase = phases[phaseIndex]
    if (!phase || phase.status === 'locked') return false

    if (!savedProgress) {
      return phaseIndex === 0 && missionIndex === 0
    }

    if (savedProgress.currentPhase === phaseIndex) {
      const answeredCount = savedProgress.phaseAnswers?.filter((answer) => answer !== undefined).length ?? 0
      return missionIndex === answeredCount
    }

    return phase.status === 'available' && missionIndex === 0
  }

  const getPhaseEntryMissionIndex = (phaseIndex: number) => {
    const missionCount = gameData.phases[phaseIndex]?.questions.length ?? 0
    for (let missionIndex = 0; missionIndex < missionCount; missionIndex += 1) {
      if (canPlayMission(phaseIndex, missionIndex)) {
        return missionIndex
      }
    }

    return 0
  }

  const getMissionAnswer = (phaseIndex: number, missionIndex: number) => {
    const phase = phases[phaseIndex]
    if (!phase || !savedProgress) return undefined

    if (phase.status === 'completed' || phase.status === 'failed') {
      return savedProgress.allPhaseAnswers?.[phaseIndex]?.[missionIndex]
    }

    if (savedProgress.currentPhase === phaseIndex) {
      return savedProgress.phaseAnswers?.[missionIndex]
    }

    return undefined
  }

  const getMissionState = (phaseIndex: number, missionIndex: number): MissionState => {
    const phase = phases[phaseIndex]
    if (!phase || phase.status === 'locked') return 'locked'

    const answer = getMissionAnswer(phaseIndex, missionIndex)
    if (answer === true) return 'correct'
    if (answer === false) return 'wrong'
    if (isMissionCurrent(phaseIndex, missionIndex)) return 'current'
    if (canPlayMission(phaseIndex, missionIndex)) return 'available'

    return 'locked'
  }

  const getMissionColor = (phaseIndex: number, missionIndex: number) => {
    const phase = phases[phaseIndex]
    if (!phase) return '#CBD5E1'

    const baseColor = colorMap[phase.color] || colorMap.green
    const missionState = getMissionState(phaseIndex, missionIndex)

    switch (missionState) {
      case 'locked':
        return '#CBD5E1'
      case 'wrong':
        return '#F87171'
      case 'current':
      case 'correct':
      case 'available':
      default:
        return baseColor
    }
  }

  const handleMissionClick = (phaseIndex: number, missionIndex: number) => {
    if (!canPlayMission(phaseIndex, missionIndex)) return

    const currentPhaseAnswers =
      savedProgress?.currentPhase === phaseIndex
        ? savedProgress.phaseAnswers || []
        : phases[phaseIndex]?.status === 'completed' || phases[phaseIndex]?.status === 'failed'
        ? savedProgress?.allPhaseAnswers?.[phaseIndex] || []
        : []

    saveProgress({
      currentPhase: phaseIndex,
      currentQuestion: missionIndex,
      phaseAnswers: currentPhaseAnswers,
      allPhaseScores: savedProgress?.allPhaseScores || [],
      allPhaseAnswers: savedProgress?.allPhaseAnswers || [],
    })

    router.push('/game')
  }

  const handleCertificateClick = () => {
    if (hasCompletedJourney()) {
      router.push('/certificate')
    }
  }

  const handleKeyboardActivate = (
    event: KeyboardEvent<SVGGElement>,
    action: () => void,
    enabled: boolean
  ) => {
    if (!enabled) return

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      action()
    }
  }

  const ROAD_WIDTH = 440
  const PHASE_RADIUS = 30
  const MISSION_RADIUS = 16
  const TROPHY_RADIUS = 30
  const START_Y = 190
  const VERTICAL_SPACING = 84
  const PHASE_EXTRA_SPACING = 54
  const totalMissions = gameData.phases.reduce((acc, phase) => acc + phase.questions.length, 0)

  const generateRoadPoints = () => {
    const points: RoadPoint[] = []
    let currentY = START_Y

    gameData.phases.forEach((phase, phaseIndex) => {
      const phaseX = ROAD_WIDTH / 2 + Math.sin((currentY + phaseIndex * 48) / 175) * 86
      points.push({
        x: phaseX,
        y: currentY,
        type: 'phase',
        phaseIndex,
      })

      currentY += PHASE_EXTRA_SPACING

      phase.questions.forEach((_, missionIndex) => {
        const y = currentY + missionIndex * VERTICAL_SPACING
        const x =
          ROAD_WIDTH / 2 +
          Math.sin((y + phaseIndex * 36) / 140) * 110 +
          Math.cos((y + phaseIndex * 20) / 280) * 26

        points.push({
          x,
          y,
          type: 'mission',
          phaseIndex,
          missionIndex,
        })
      })

      currentY += phase.questions.length * VERTICAL_SPACING + PHASE_EXTRA_SPACING
    })

    return { points, totalHeight: currentY + 180 }
  }

  const { points: roadPoints, totalHeight: svgHeight } = generateRoadPoints()
  const trophyPoint = { x: ROAD_WIDTH / 2, y: svgHeight - 94 }
  const roadPathPoints = [
    { x: ROAD_WIDTH / 2, y: 92 },
    ...roadPoints,
    { x: trophyPoint.x, y: trophyPoint.y - 40 },
  ]

  const roadPath = (() => {
    if (roadPathPoints.length < 2) return ''

    let d = `M ${roadPathPoints[0].x} ${roadPathPoints[0].y}`

    for (let index = 1; index < roadPathPoints.length; index += 1) {
      const prev = roadPathPoints[index - 1]
      const current = roadPathPoints[index]
      const cp1x = prev.x + (current.x - prev.x) * 0.35
      const cp1y = prev.y + (current.y - prev.y) * 0.3
      const cp2x = prev.x + (current.x - prev.x) * 0.7
      const cp2y = prev.y + (current.y - prev.y) * 0.7
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`
    }

    return d
  })()

  const TERRITORY_TOP = 12
  const TERRITORY_BOTTOM = svgHeight + 36
  const TERRITORY_SAMPLES = 14
  const TERRITORY_MIN_GAP = 88

  const getPhaseStatusForMap = (phaseIndex: number): PhaseState['status'] =>
    phases[phaseIndex]?.status ?? (phaseIndex === 0 ? 'available' : 'locked')

  const getTerritoryOpacity = (status: PhaseState['status']) => {
    switch (status) {
      case 'available':
        return 0.3
      case 'completed':
        return 0.24
      case 'failed':
        return 0.18
      case 'locked':
      default:
        return 0.12
    }
  }

  const buildSmoothPath = (points: BoundaryPoint[]) => {
    if (points.length < 2) return ''

    let d = `M ${points[0].x} ${points[0].y}`

    for (let index = 1; index < points.length; index += 1) {
      const previous = points[index - 1]
      const current = points[index]
      const cp1x = previous.x + (current.x - previous.x) * 0.35
      const cp1y = previous.y
      const cp2x = previous.x + (current.x - previous.x) * 0.7
      const cp2y = current.y
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`
    }

    return d
  }

  const buildClosedTerritoryPath = (topEdge: BoundaryPoint[], bottomEdge: BoundaryPoint[]) => {
    if (topEdge.length < 2 || bottomEdge.length < 2) return ''

    const lowerEdge = [...bottomEdge].reverse()
    let d = buildSmoothPath(topEdge)
    d += ` L ${lowerEdge[0].x} ${lowerEdge[0].y}`

    for (let index = 1; index < lowerEdge.length; index += 1) {
      const previous = lowerEdge[index - 1]
      const current = lowerEdge[index]
      const cp1x = previous.x + (current.x - previous.x) * 0.35
      const cp1y = previous.y
      const cp2x = previous.x + (current.x - previous.x) * 0.7
      const cp2y = current.y
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`
    }

    d += ' Z'
    return d
  }

  const territorySamples = Array.from({ length: TERRITORY_SAMPLES + 1 }, (_, index) => {
    const t = index / TERRITORY_SAMPLES
    return {
      t,
      x: t * ROAD_WIDTH,
    }
  })

  const phaseVerticalRanges = gameData.phases.map((_, phaseIndex) => {
    const points = roadPoints.filter((point) => point.phaseIndex === phaseIndex)
    const yValues = points.map((point) => point.y)
    const minY = yValues.length ? Math.min(...yValues) : START_Y + phaseIndex * 260
    const maxY = yValues.length ? Math.max(...yValues) : minY + 220

    return {
      top: Math.max(TERRITORY_TOP + 34, minY - (phaseIndex === 0 ? 148 : 96)),
      bottom: Math.min(
        TERRITORY_BOTTOM - 34,
        maxY + (phaseIndex === totalPhases - 1 ? 174 : 108)
      ),
    }
  })

  const phaseBoundaryLines: BoundaryPoint[][] = phaseVerticalRanges.slice(0, -1).map((range, boundaryIndex) => {
    const nextRange = phaseVerticalRanges[boundaryIndex + 1]
    const baseY = (range.bottom + nextRange.top) / 2

    return territorySamples.map(({ t, x }) => {
      const largeWave =
        Math.sin(t * Math.PI * (1.7 + boundaryIndex * 0.2) + boundaryIndex * 1.2) *
        (16 + (boundaryIndex % 2) * 5)
      const mediumWave =
        Math.cos(t * Math.PI * (4.8 + boundaryIndex * 0.3) + boundaryIndex * 0.8) *
        (7 + (boundaryIndex % 3))
      const smallWave = Math.sin(t * Math.PI * 10 + boundaryIndex * 1.5) * 2.6
      const lateralDrift = (t - 0.5) * (boundaryIndex % 2 === 0 ? 20 : -18)

      return {
        x,
        y: baseY + largeWave + mediumWave + smallWave + lateralDrift,
      }
    })
  })

  phaseBoundaryLines.forEach((line, boundaryIndex) => {
    line.forEach((point, sampleIndex) => {
      const minY =
        boundaryIndex === 0
          ? TERRITORY_TOP + 74
          : phaseBoundaryLines[boundaryIndex - 1][sampleIndex].y + TERRITORY_MIN_GAP
      const remainingBoundaries = phaseBoundaryLines.length - boundaryIndex
      const maxY = TERRITORY_BOTTOM - remainingBoundaries * (TERRITORY_MIN_GAP - 12)

      point.y = clampValue(point.y, minY, maxY)
    })
  })

  for (let boundaryIndex = phaseBoundaryLines.length - 2; boundaryIndex >= 0; boundaryIndex -= 1) {
    const currentLine = phaseBoundaryLines[boundaryIndex]
    const nextLine = phaseBoundaryLines[boundaryIndex + 1]

    currentLine.forEach((point, sampleIndex) => {
      point.y = Math.min(point.y, nextLine[sampleIndex].y - TERRITORY_MIN_GAP)
    })
  }

  const topBoundary = territorySamples.map(({ x }) => ({ x, y: TERRITORY_TOP }))
  const bottomBoundary = territorySamples.map(({ x }) => ({ x, y: TERRITORY_BOTTOM }))

  const territoryRegions: TerritoryRegion[] = gameData.phases.map((phase, phaseIndex) => {
    const topEdge = phaseIndex === 0 ? topBoundary : phaseBoundaryLines[phaseIndex - 1]
    const bottomEdge = phaseIndex === totalPhases - 1 ? bottomBoundary : phaseBoundaryLines[phaseIndex]

    return {
      phaseIndex,
      color: colorMap[phase.color] || colorMap.green,
      fillOpacity: getTerritoryOpacity(getPhaseStatusForMap(phaseIndex)),
      path: buildClosedTerritoryPath(topEdge, bottomEdge),
    }
  })

  const territoryBoundaryPaths = phaseBoundaryLines.map((line) => buildSmoothPath(line))

  const renderMissionIcon = (phaseIndex: number, missionIndex: number) => {
    const missionState = getMissionState(phaseIndex, missionIndex)

    if (missionState === 'correct') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polyline points="20 6 10.8 17 4 11.2" />
        </svg>
      )
    }

    if (missionState === 'wrong') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      )
    }

    if (missionState === 'current') {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
          <polygon points="6 3 20 12 6 21 6 3" />
        </svg>
      )
    }

    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    )
  }

  const getCurrentObjective = () => {
    if (hasCompletedJourney()) {
      return 'Troféu liberado. Toque no final da trilha para abrir a página do certificado.'
    }

    const nextMission = roadPoints.find(
      (point) =>
        point.type === 'mission' &&
        point.missionIndex !== undefined &&
        getMissionState(point.phaseIndex, point.missionIndex) === 'current'
    )

    if (!nextMission || nextMission.missionIndex === undefined) {
      return 'Toque na fase liberada para continuar sua jornada.'
    }

    const phase = gameData.phases[nextMission.phaseIndex]
    return `Próxima parada: ${getPhaseTitle(phase.name)}, missão ${nextMission.missionIndex + 1}.`
  }

  useEffect(() => {
    if (!phases.length) return

    const container = scrollContainerRef.current
    if (!container) return

    const targetPoint =
      (hasCompletedJourney()
        ? trophyPoint
        : roadPoints.find(
            (point) =>
              point.type === 'mission' &&
              point.missionIndex !== undefined &&
              getMissionState(point.phaseIndex, point.missionIndex) === 'current'
          )) || roadPoints[0]

    if (!targetPoint) return

    const frame = window.requestAnimationFrame(() => {
      const offsetTop = Math.max(0, targetPoint.y - container.clientHeight * 0.35)
      container.scrollTo({ top: offsetTop, behavior: 'smooth' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [phases, savedProgress])

  const completedPhaseCount = phases.filter((phase) => phase.status === 'completed').length

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[linear-gradient(180deg,#f7fbff_0%,#e0f2fe_45%,#dbeafe_100%)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-12 h-44 w-44 rounded-full bg-white/70 blur-3xl" />
        <div className="absolute right-[-10%] top-36 h-52 w-52 rounded-full bg-cyan-100/70 blur-3xl" />
        <div className="absolute left-[18%] top-[34%] h-28 w-28 rounded-full bg-white/60 blur-2xl" />
        <div className="absolute right-[12%] top-[56%] h-36 w-36 rounded-full bg-sky-100/60 blur-3xl" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 px-4 pt-4">
        <div className="pointer-events-auto mx-auto max-w-md rounded-[30px] border border-white/70 bg-white/80 px-5 py-4 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                Jornada CURA
              </p>
              <h1 className="text-xl font-black text-slate-900">Mapa de fases</h1>
            </div>
            <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-700">
                Progresso
              </p>
              <p className="text-lg font-black text-emerald-600">
                {completedPhaseCount}/{totalPhases}
              </p>
            </div>
          </div>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-600">{getCurrentObjective()}</p>
          <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{totalMissions} missões no total</span>
            <span>Toque nos círculos liberados</span>
          </div>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden pt-44"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="relative w-full" style={{ height: svgHeight + 36 }}>
          <svg
            width="100%"
            height={svgHeight + 36}
            viewBox={`0 0 ${ROAD_WIDTH} ${svgHeight + 36}`}
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="territoryShade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.34" />
                <stop offset="28%" stopColor="#FFFFFF" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.06" />
              </linearGradient>
            </defs>

            {territoryRegions.map((territory) => (
              <path
                key={`territory-${territory.phaseIndex}`}
                d={territory.path}
                fill={territory.color}
                opacity={territory.fillOpacity}
              />
            ))}

            <rect x="0" y="0" width={ROAD_WIDTH} height={svgHeight + 36} fill="url(#territoryShade)" />

            {territoryBoundaryPaths.map((boundaryPath, index) => (
              <g key={`territory-border-${index}`}>
                <path
                  d={boundaryPath}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.34"
                />
                <path
                  d={boundaryPath}
                  fill="none"
                  stroke="white"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  strokeDasharray="8 10"
                  opacity="0.28"
                />
              </g>
            ))}
          </svg>

          <svg
            width={ROAD_WIDTH}
            height={svgHeight + 36}
            viewBox={`0 0 ${ROAD_WIDTH} ${svgHeight + 36}`}
            className="absolute left-1/2 top-0 -translate-x-1/2"
          >
            <text
              x={ROAD_WIDTH / 2}
              y="54"
              textAnchor="middle"
              className="fill-slate-500 text-[11px] font-semibold uppercase tracking-[0.3em]"
            >
            início da jornada
            </text>
            <circle cx={ROAD_WIDTH / 2} cy="92" r="10" fill="#0F766E" opacity="0.18" />
            <circle cx={ROAD_WIDTH / 2} cy="92" r="6" fill="#0F766E" />

            <path
              d={roadPath}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <path
              d={roadPath}
              fill="none"
              stroke="#94A3B8"
              strokeWidth="8"
              strokeDasharray="1 18"
              strokeLinecap="round"
              opacity="0.85"
            />
            <path
              d={roadPath}
              fill="none"
              stroke="white"
              strokeWidth="4"
              strokeDasharray="1 18"
              strokeLinecap="round"
              opacity="0.95"
            />

            {roadPoints.map((point) => {
              if (point.type === 'phase') {
                const phase = phases[point.phaseIndex]
                if (!phase) return null

                const phaseColor = getPhaseColor(phase)
                const entryMissionIndex = getPhaseEntryMissionIndex(point.phaseIndex)
                const isInteractive = canPlayMission(point.phaseIndex, entryMissionIndex)
                const isAvailable = phase.status === 'available'

                return (
                  <g
                    key={`phase-${point.phaseIndex}`}
                    transform={`translate(${point.x} ${point.y})`}
                    className={isInteractive ? 'group cursor-pointer focus:outline-none' : 'group'}
                    onClick={() => isInteractive && handleMissionClick(point.phaseIndex, entryMissionIndex)}
                    onKeyDown={(event) =>
                      handleKeyboardActivate(
                        event,
                        () => handleMissionClick(point.phaseIndex, entryMissionIndex),
                        isInteractive
                      )
                    }
                    tabIndex={isInteractive ? 0 : -1}
                    role={isInteractive ? 'button' : undefined}
                    aria-label={`Fase ${phase.id}. ${getPhaseTitle(phase.name)}. ${phaseStatusLabel[phase.status]}.`}
                  >
                    <circle
                      r={PHASE_RADIUS + 14}
                      fill={phaseColor}
                      opacity={isAvailable ? '0.22' : '0.12'}
                      className={
                        isAvailable
                          ? 'animate-pulse'
                          : 'opacity-0 transition-opacity duration-200 group-hover:opacity-20'
                      }
                    />
                    <circle r={PHASE_RADIUS + 6} fill={phaseColor} opacity="0.18" />
                    <circle r={PHASE_RADIUS} fill={phaseColor} stroke="white" strokeWidth="4" />
                    <circle
                      r={PHASE_RADIUS - 6}
                      fill="white"
                      opacity={phase.status === 'locked' ? '0.22' : '0.14'}
                    />

                    <text
                      x="0"
                      y="7"
                      textAnchor="middle"
                      fill="white"
                      fontSize="20"
                      fontWeight="900"
                      stroke="#0F172A"
                      strokeWidth="0.8"
                      paintOrder="stroke"
                    >
                      {phase.id}
                    </text>

                    <foreignObject
                      x={-72}
                      y={-PHASE_RADIUS - 56}
                      width="144"
                      height="42"
                      pointerEvents="none"
                    >
                      <div className="flex h-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/88 px-3 text-center text-[11px] font-semibold text-slate-700 shadow-md backdrop-blur">
                        {getPhaseTitle(phase.name)}
                      </div>
                    </foreignObject>
                  </g>
                )
              }

              const { phaseIndex, missionIndex } = point
              if (missionIndex === undefined) return null

              const missionState = getMissionState(phaseIndex, missionIndex)
              const missionColor = getMissionColor(phaseIndex, missionIndex)
              const isInteractive = canPlayMission(phaseIndex, missionIndex)

              return (
                <g
                  key={`mission-${phaseIndex}-${missionIndex}`}
                  transform={`translate(${point.x} ${point.y})`}
                  className={isInteractive ? 'group cursor-pointer focus:outline-none' : 'group'}
                  onClick={() => isInteractive && handleMissionClick(phaseIndex, missionIndex)}
                  onKeyDown={(event) =>
                    handleKeyboardActivate(event, () => handleMissionClick(phaseIndex, missionIndex), isInteractive)
                  }
                  tabIndex={isInteractive ? 0 : -1}
                  role={isInteractive ? 'button' : undefined}
                  aria-label={`Fase ${phaseIndex + 1}, missão ${missionIndex + 1}.`}
                >
                  <circle
                    r={MISSION_RADIUS + 10}
                    fill={missionColor}
                    opacity={missionState === 'current' ? '0.24' : '0'}
                    className={
                      missionState === 'current'
                        ? 'animate-pulse'
                        : 'transition-opacity duration-200 group-hover:opacity-20'
                    }
                  />
                  <circle
                    r={MISSION_RADIUS + 4}
                    fill="white"
                    opacity={missionState === 'locked' ? '0.45' : '0.96'}
                  />
                  <circle
                    r={MISSION_RADIUS}
                    fill={missionColor}
                    stroke={missionState === 'locked' ? '#94A3B8' : 'white'}
                    strokeWidth="3"
                  />

                  <foreignObject x="-8" y="-8" width="16" height="16" pointerEvents="none">
                    {renderMissionIcon(phaseIndex, missionIndex)}
                  </foreignObject>
                </g>
              )
            })}

            <g
              transform={`translate(${trophyPoint.x} ${trophyPoint.y})`}
              className={hasCompletedJourney() ? 'group cursor-pointer focus:outline-none' : 'group'}
              onClick={handleCertificateClick}
              onKeyDown={(event) =>
                handleKeyboardActivate(event, handleCertificateClick, hasCompletedJourney())
              }
              tabIndex={hasCompletedJourney() ? 0 : -1}
              role={hasCompletedJourney() ? 'button' : undefined}
              aria-label="Troféu final e página do certificado."
            >
              <circle
                r={TROPHY_RADIUS + 14}
                fill={hasCompletedJourney() ? '#FACC15' : '#CBD5E1'}
                opacity={hasCompletedJourney() ? '0.28' : '0.15'}
                className={hasCompletedJourney() ? 'animate-pulse' : ''}
              />
              <circle
                r={TROPHY_RADIUS + 5}
                fill={hasCompletedJourney() ? '#FDE68A' : '#E2E8F0'}
                opacity="0.9"
              />
              <circle
                r={TROPHY_RADIUS}
                fill={hasCompletedJourney() ? '#F59E0B' : '#94A3B8'}
                stroke={hasCompletedJourney() ? '#92400E' : '#64748B'}
                strokeWidth="4"
              />
              <svg
                x="-14"
                y="-14"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              <text
                x="0"
                y={TROPHY_RADIUS + 34}
                textAnchor="middle"
                className="fill-slate-700 text-sm font-bold"
              >
                {hasCompletedJourney() ? 'Troféu liberado' : 'Troféu final'}
              </text>
              <text
                x="0"
                y={TROPHY_RADIUS + 52}
                textAnchor="middle"
                className="fill-slate-500 text-[11px] font-semibold"
              >
                {hasCompletedJourney() ? 'Gerar certificado' : 'Conclua todas as fases'}
              </text>
            </g>
          </svg>

          <div className="pointer-events-none absolute left-0 top-32 w-32 opacity-95">
            <Image src="/segurando-cateter.png" alt="Enfermeira" width={128} height={256} />
          </div>
          <div className="pointer-events-none absolute right-4 top-[28%] w-32 opacity-85">
            <Image src="/explicando.png" alt="Enfermeira" width={128} height={256} />
          </div>
          {/* <div className="pointer-events-none absolute left-6 top-[27%] w-32 opacity-85">
            <Image src="/feliz.png" alt="Enfermeira" width={128} height={256} />
          </div> */}
          {/* <div className="pointer-events-none absolute right-0 top-[36%] w-32 opacity-90">
            <Image src="/neutro.png" alt="Enfermeira" width={128} height={256} />
          </div> */}
          {/* <div className="pointer-events-none absolute right-5 top-[49%] w-32 opacity-85">
            <Image src="/pensando.png" alt="Enfermeira" width={128} height={256} />
          </div> */}
          <div className="pointer-events-none absolute left-2 top-[42%] w-32 opacity-85">
            <Image src="/contentamento.png" alt="Enfermeira" width={128} height={256} />
          </div>
          <div className="pointer-events-none absolute right-6 top-[59%] w-32 opacity-85">
            <Image src="/explicando2.png" alt="Enfermeira" width={128} height={256} />
          </div>
          <div className="pointer-events-none absolute left-5 bottom-44 w-32 opacity-90">
            <Image src="/colocando-luva.png" alt="Enfermeira" width={128} height={256} />
          </div>
        </div>
      </div>
    </div>
  )
}
