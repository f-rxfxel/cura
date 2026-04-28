"use client"

import { useEffect, useState } from "react"

interface TimerProps {
  duration: number
  onTimeout: () => void
  isActive: boolean
}

export function Timer({ duration, onTimeout, isActive }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    if (!isActive) return

    if (timeLeft <= 0) {
      onTimeout()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, isActive, onTimeout])

  const percentage = (timeLeft / duration) * 100
  const isLow = timeLeft <= 5

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-muted-foreground">Tempo restante</span>
        <span className={`text-2xl font-bold ${isLow ? "text-error animate-pulse" : "text-foreground"}`}>
          {timeLeft}s
        </span>
      </div>
      <div className="h-3 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isLow ? "bg-error" : "bg-gradient-to-r from-primary to-secondary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
