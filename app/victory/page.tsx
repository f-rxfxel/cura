'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { saveScore, clearProgress, getProgress } from '@/lib/game-storage'
import { Trophy, Download, Home } from 'lucide-react'
import questionsData from '@/data/questions.json'
import type { GameData } from '@/lib/game-logic'

export default function VictoryPage() {
  const router = useRouter()
  const [gameData] = useState<GameData>(questionsData as GameData)
  const [playerName, setPlayerName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [totalPercentage, setTotalPercentage] = useState(0)

  useEffect(() => {
    // Calculate total percentage from saved progress
    const progress = getProgress()
    if (progress && progress.allPhaseScores.length > 0) {
      const total = progress.allPhaseScores.reduce(
        (sum, score) => sum + score,
        0
      )
      const avg = Math.round(total / progress.allPhaseScores.length)
      setTotalPercentage(avg)
    }
  }, [])

  const handleGenerateCertificate = async () => {
    if (!playerName.trim()) {
      alert('Por favor, insira seu nome completo')
      return
    }

    setIsGenerating(true)

    try {
      // Save score to leaderboard
      const progress = getProgress()
      saveScore({
        playerName: playerName.trim(),
        totalPercentage,
        date: new Date().toISOString(),
        phaseScores: progress?.allPhaseScores || [],
      })

      // Generate PDF certificate
      const response = await fetch('/api/generate-certificate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerName: playerName.trim(),
          totalPercentage,
          date: new Date().toLocaleDateString('pt-BR'),
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `certificado-${playerName.trim().replace(/\s+/g, '-')}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        // Clear progress after successful completion
        clearProgress()

        // Show success message
        alert('Certificado gerado com sucesso!')
      } else {
        throw new Error('Erro ao gerar certificado')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao gerar certificado. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleHome = () => {
    clearProgress()
    router.push('/inicio')
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <Card className='w-full max-w-lg p-8 bg-card border-2 border-primary shadow-2xl animate-bounce-in'>
        <div className='text-center mb-8'>
          <div className='mb-6 flex justify-center'>
            <div className='w-32 h-32 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg animate-pulse-glow'>
              <Trophy className='h-16 w-16 text-white' />
            </div>
          </div>

          <h1 className='text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent'>
            Vitória!
          </h1>
          <p className='text-xl text-muted-foreground mb-4'>
            Você completou todas as 6 fases!
          </p>

          <div className='mb-6 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border-2 border-primary/30'>
            <p className='text-sm text-muted-foreground mb-2'>
              Desempenho Total
            </p>
            <p className='text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
              {totalPercentage}%
            </p>
            <p className='text-sm text-muted-foreground mt-2'>
              de acertos no jogo completo
            </p>
          </div>
        </div>

        <div className='space-y-6'>
          <div>
            <Label
              htmlFor='playerName'
              className='text-base font-semibold text-foreground mb-2 block'
            >
              Digite seu nome completo para receber o certificado
            </Label>
            <Input
              id='playerName'
              type='text'
              placeholder='Seu nome completo'
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className='h-12 text-lg'
              disabled={isGenerating}
            />
          </div>

          <div className='space-y-3'>
            <Button
              onClick={handleGenerateCertificate}
              disabled={isGenerating || !playerName.trim()}
              size='lg'
              className='w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white font-bold h-14'
            >
              {isGenerating ? (
                'Gerando certificado...'
              ) : (
                <>
                  <Download className='mr-2 h-5 w-5' />
                  Gerar Certificado PDF
                </>
              )}
            </Button>

            <Button
              onClick={handleHome}
              size='lg'
              variant='outline'
              className='w-full bg-transparent'
            >
              <Home className='mr-2 h-5 w-5' />
              Voltar ao Início
            </Button>
          </div>
        </div>

        <div className='mt-6 p-4 bg-muted rounded-xl'>
          <p className='text-xs text-muted-foreground text-center'>
            Seu desempenho será salvo no Placar. Você pode visualizá-lo na tela
            de Início.
          </p>
        </div>
      </Card>
    </div>
  )
}
