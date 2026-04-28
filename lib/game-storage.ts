export interface GameScore {
  playerName: string
  totalPercentage: number
  date: string
  phaseScores: number[]
}

export interface GameProgress {
  currentPhase: number
  currentQuestion: number
  phaseAnswers: boolean[]
  allPhaseScores: number[]
  allPhaseAnswers?: boolean[][] // Respostas de todas as fases [phaseIndex][questionIndex]
}

const STORAGE_KEY = "quiz-game-scores"
const PROGRESS_KEY = "quiz-game-progress"

export function saveScore(score: GameScore): void {
  if (typeof window === "undefined") return

  const scores = getScores()
  scores.push(score)
  scores.sort((a, b) => b.totalPercentage - a.totalPercentage)

  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
}

export function getScores(): GameScore[] {
  if (typeof window === "undefined") return []

  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveProgress(progress: GameProgress): void {
  if (typeof window === "undefined") return
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
}

export function getProgress(): GameProgress | null {
  if (typeof window === "undefined") return null

  const data = localStorage.getItem(PROGRESS_KEY)
  return data ? JSON.parse(data) : null
}

export function clearProgress(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(PROGRESS_KEY)
}
