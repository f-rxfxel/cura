export interface Question {
  id: number
  reference: string
  question: string
  options: string[]
  correctAnswer: number
}

export interface Phase {
  id: number
  name: string
  color: string
  questions: Question[]
}

export interface GameData {
  phases: Phase[]
}

export function calculatePercentage(correct: number, total: number): number {
  return Math.round((correct / total) * 100)
}

export function hasPassedPhase(percentage: number): boolean {
  return percentage >= 60
}

export function getPhaseColor(color: string): string {
  const colorMap: Record<string, string> = {
    green: "var(--color-phase-green)",
    blue: "var(--color-phase-blue)",
    yellow: "var(--color-phase-yellow)",
    red: "var(--color-phase-red)",
    purple: "var(--color-phase-purple)",
    brown: "var(--color-phase-brown)"
  }
  return colorMap[color] || colorMap.green
}

export function getPhaseColorClass(color: string): string {
  const colorMap: Record<string, string> = {
    green: "from-emerald-500 to-green-400",
    blue: "from-blue-500 to-cyan-400",
    yellow: "from-yellow-500 to-amber-400",
    red: "from-red-500 to-pink-500",
    purple: "from-purple-500 to-violet-400",
    brown: "from-brown-500 to-brown-400"
  }
  return colorMap[color] || colorMap.green
}

export function shuffleQuestion(question: Question): {
  shuffledOptions: string[]
  shuffledCorrectAnswer: number
} {
  const indexes = question.options.map((_, index) => index)
  for (let i = indexes.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indexes[i], indexes[j]] = [indexes[j], indexes[i]]
  }

  const shuffledOptions = indexes.map((originalIndex) => question.options[originalIndex])
  const shuffledCorrectAnswer = indexes.findIndex((originalIndex) => originalIndex === question.correctAnswer)

  return {
    shuffledOptions,
    shuffledCorrectAnswer,
  }
}
