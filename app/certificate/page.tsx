'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { clearProgress, getProgress } from '@/lib/game-storage'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Download, ArrowLeft } from 'lucide-react'
import questionsData from '@/data/questions.json'
import type { GameData } from '@/lib/game-logic'

export default function CertificatePage() {
  const router = useRouter()
  const [playerName, setPlayerName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [totalPercentage, setTotalPercentage] = useState(0)
  const gameData = questionsData as GameData
  const totalPhases = gameData.phases.length

  useEffect(() => {
    const savedProgress = getProgress()

    const hasCompletedJourney =
      !!savedProgress &&
      gameData.phases.every((_, index) => (savedProgress.allPhaseScores?.[index] ?? -1) >= 60)

    if (!hasCompletedJourney) {
      router.push('/phase-selection')
      return
    }

    const total =
      savedProgress.allPhaseScores
        .slice(0, totalPhases)
        .reduce((sum, score) => sum + score, 0) / totalPhases

    setTotalPercentage(Math.round(total))
  }, [router, totalPhases])

  const handleGenerateCertificate = async () => {
    const trimmedName = playerName.trim()

    if (!trimmedName) {
      alert('Por favor, insira seu nome')
      return
    }

    setIsGenerating(true)

    try {
      const response = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: trimmedName,
          totalPercentage,
          date: new Date().toLocaleDateString('pt-BR'),
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao gerar certificado')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `certificado-${trimmedName.replace(/\s+/g, '-').toLowerCase()}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(anchor)

      clearProgress()
    } catch (error) {
      console.error('Erro ao gerar certificado:', error)
      alert('Erro ao gerar certificado. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 pb-8 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 shadow-lg">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-800">
            Parabéns!
          </CardTitle>
          <p className="text-gray-600">
            Você completou as {totalPhases} fases com sucesso!
          </p>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-medium text-emerald-800">Pontuação Total</p>
            <p className="text-4xl font-bold text-emerald-600">{totalPercentage}%</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="playerName" className="text-sm font-medium text-gray-700">
              Digite seu nome completo para o certificado:
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Nome completo"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-transparent focus:ring-2 focus:ring-emerald-500"
              maxLength={100}
            />
          </div>

          <Button
            onClick={handleGenerateCertificate}
            disabled={isGenerating || !playerName.trim()}
            className="w-full py-6 text-lg"
            size="lg"
          >
            {isGenerating ? (
              <>
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Gerando Certificado...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Gerar Certificado
              </>
            )}
          </Button>

          <Button
            onClick={() => router.push('/phase-selection')}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Mapa
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
