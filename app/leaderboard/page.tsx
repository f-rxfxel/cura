"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, Trophy, Medal, Award, Calendar, Trash2 } from "lucide-react"
import { getScores, type GameScore } from "@/lib/game-storage"

export default function LeaderboardPage() {
  const [scores, setScores] = useState<GameScore[]>([])

  useEffect(() => {
    setScores(getScores())
  }, [])

  const handleClearScores = () => {
    if (confirm("Tem certeza que deseja limpar todo o placar? Esta ação não pode ser desfeita.")) {
      localStorage.removeItem("quiz-game-scores")
      setScores([])
    }
  }

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />
    if (index === 2) return <Award className="h-6 w-6 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
  }

  const getPositionColor = (index: number) => {
    if (index === 0) return "from-yellow-500/20 to-yellow-600/10 border-yellow-500/30"
    if (index === 1) return "from-gray-400/20 to-gray-500/10 border-gray-400/30"
    if (index === 2) return "from-amber-600/20 to-amber-700/10 border-amber-600/30"
    return "from-muted/50 to-muted/20 border-border"
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <Link href="/inicio">
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>

          {scores.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearScores} className="text-error hover:text-error">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar Placar
            </Button>
          )}
        </div>

        <Card className="p-8 bg-card border-2 border-border shadow-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Placar
              </h1>
              <p className="text-sm text-muted-foreground">Melhores desempenhos</p>
            </div>
          </div>

          {scores.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-xl font-semibold text-foreground mb-2">Nenhum registro ainda</p>
              <p className="text-muted-foreground mb-6">Complete o jogo para aparecer no placar!</p>
              <Link href="/game">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90">
                  Começar a Jogar
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {scores.map((score, index) => (
                <div
                  key={`${score.playerName}-${score.date}-${index}`}
                  className={`p-4 rounded-xl bg-gradient-to-r ${getPositionColor(index)} border-2 transition-all hover:scale-[1.02]`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-background/50 flex items-center justify-center">
                      {getMedalIcon(index)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-foreground truncate">{score.playerName}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(score.date).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    <div className="flex-shrink-0 text-right">
                      <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        {score.totalPercentage}%
                      </p>
                      <p className="text-xs text-muted-foreground">total</p>
                    </div>
                  </div>

                  {score.phaseScores && score.phaseScores.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2">Desempenho por fase:</p>
                      <div className="flex gap-2 flex-wrap">
                        {score.phaseScores.map((phaseScore, phaseIndex) => (
                          <div
                            key={phaseIndex}
                            className="px-2 py-1 rounded bg-background/50 text-xs font-medium text-foreground"
                          >
                            F{phaseIndex + 1}: {phaseScore}%
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {scores.length > 0 && (
            <div className="mt-6 p-4 bg-muted rounded-xl">
              <p className="text-sm text-muted-foreground text-center">
                Total de jogadores: <span className="font-bold text-foreground">{scores.length}</span>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
