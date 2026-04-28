'use client'

import { useEffect, useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { clearProgress, saveProgress, getProgress } from '@/lib/game-storage'
import {
  Trophy,
  XCircle,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Lock,
  Home,
  Flag,
  Check,
} from 'lucide-react'
import questionsData from '@/data/questions.json'
import type { GameData } from '@/lib/game-logic'
import { PhaseRoadmap } from '@/components/phase-roadmap'

function PhaseResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [gameData] = useState<GameData>(questionsData as GameData)

  const phase = Number.parseInt(searchParams.get('phase') || '1')
  const percentage = Number.parseInt(searchParams.get('percentage') || '0')
  const passed = searchParams.get('passed') === 'true'

  const isLastPhase = phase === gameData.phases.length
  const currentPhaseIndex = phase - 1

  const phaseColors = [
    {
      bg: 'bg-emerald-500',
      border: 'border-emerald-500',
      text: 'text-emerald-500',
      light: 'bg-emerald-500/10',
    },
    {
      bg: 'bg-blue-500',
      border: 'border-blue-500',
      text: 'text-blue-500',
      light: 'bg-blue-500/10',
    },
    {
      bg: 'bg-cyan-500',
      border: 'border-cyan-500',
      text: 'text-cyan-500',
      light: 'bg-cyan-500/10',
    },
    {
      bg: 'bg-yellow-500',
      border: 'border-yellow-500',
      text: 'text-yellow-500',
      light: 'bg-yellow-500/10',
    },
    {
      bg: 'bg-red-500',
      border: 'border-red-500',
      text: 'text-red-500',
      light: 'bg-red-500/10',
    },
    {
      bg: 'bg-purple-500',
      border: 'border-purple-500',
      text: 'text-purple-500',
      light: 'bg-purple-500/10',
    },
  ]

  useEffect(() => {
    if (!passed) {
      clearProgress()
    }
  }, [passed])

  const handleNext = () => {
    if (passed && !isLastPhase) {
      const currentProgress = getProgress()

      saveProgress({
        currentPhase: phase,
        currentQuestion: 0,
        phaseAnswers: [],
        allPhaseScores: currentProgress?.allPhaseScores || [],
        allPhaseAnswers: currentProgress?.allPhaseAnswers || [],
      })

      router.push('/game')
    } else if (passed && isLastPhase) {
      router.push('/victory')
    }
  }

  const handlePhaseSelect = (phaseId: number) => {
    if (phaseId === phase + 1 && passed && !isLastPhase) {
      handleNext()
    }
  }

  const handleGenerateCertificate = () => {
    router.push('/victory')
  }

  const getCompletedPhases = () => {
    const completed: number[] = []
    for (let i = 1; i < phase; i++) {
      completed.push(i)
    }
    return completed
  }

  const handleRestart = () => {
    clearProgress()
    router.push('/game')
  }

  const handleHome = () => {
    clearProgress()
    router.push('/inicio')
  }

  if (passed) {
    return (
      <div className='min-h-screen p-4'>
        <div className='w-full max-w-6xl mx-auto space-y-6 py-8'>
          <div className='flex justify-end'>
            <Button
              onClick={handleHome}
              variant='outline'
              size='sm'
              className='gap-2 bg-transparent'
            >
              <Home className='h-4 w-4' />
              Voltar ao Início
            </Button>
          </div>

          <Card className='w-full p-8 bg-card border-2 border-success shadow-2xl animate-bounce-in'>
            <div className='flex items-center gap-6'>
              <div className='w-24 h-24 rounded-full bg-gradient-to-br from-success to-green-400 flex items-center justify-center shadow-lg'>
                <Trophy className='h-12 w-12 text-white' />
              </div>
              <div className=''>
                <h1 className='text-4xl font-bold mb-2 text-success'>
                  Parabéns!
                </h1>
                <p className='text-xl text-muted-foreground'>
                  Você passou na Fase {phase}!
                </p>
              </div>
            </div>

            <div className='relative w-fit mx-auto'>
              <div className='p-6 flex items-center justify-center gap-2 bg-success/10 rounded-2xl border-2 border-success/30'>
                <p className='text-xl text-muted-foreground'>Você teve</p>
                <p className='text-3xl font-bold text-success'>{percentage}%</p>
                <p className='text-xl text-muted-foreground'>de acertos!</p>
              </div>
              <div
                className='absolute -bottom-4 right-6 w-0 h-0 z-10'
                style={{
                  borderLeft: '16px solid transparent',
                  borderRight: '0 solid transparent',
                  borderTop: '16px solid #22c55e1a', // bg-success/10
                }}
              />
            </div>
          </Card>

          <PhaseRoadmap
            phases={gameData.phases}
            currentPhase={phase}
            completedPhases={getCompletedPhases()}
            onPhaseSelect={handlePhaseSelect}
            isPassed={passed}
            onGenerateCertificate={handleGenerateCertificate}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <Card className='w-full max-w-md p-8 bg-card border-2 border-error shadow-2xl animate-bounce-in'>
        <div className='text-center'>
          <div className='mb-6 flex justify-center'>
            <div className='w-24 h-24 rounded-full bg-gradient-to-br from-error to-red-400 flex items-center justify-center shadow-lg'>
              <XCircle className='h-12 w-12 text-white' />
            </div>
          </div>

          <h1 className='text-4xl font-bold mb-3 text-error'>Você falhou!</h1>
          <p className='text-xl text-muted-foreground mb-6'>
            Não atingiu os 60% necessários
          </p>

          <div className='mb-8 p-6 bg-error/10 rounded-2xl border-2 border-error/30'>
            <p className='text-sm text-muted-foreground mb-2'>
              Seu desempenho na Fase {phase}
            </p>
            <p className='text-5xl font-bold text-error'>{percentage}%</p>
            <p className='text-sm text-muted-foreground mt-2'>de acertos</p>
          </div>

          <div className='mb-6 p-4 bg-muted rounded-xl'>
            <p className='text-sm text-muted-foreground'>
              Você precisa de pelo menos{' '}
              <span className='font-bold text-foreground'>60%</span> de acertos
              para avançar. O jogo será reiniciado desde a Fase 1.
            </p>
          </div>

          <div className='space-y-3'>
            <Button
              onClick={handleRestart}
              size='lg'
              className='w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-bold h-14'
            >
              <RotateCcw className='mr-2 h-5 w-5' />
              Tentar Novamente
            </Button>
            <Button
              onClick={handleHome}
              size='lg'
              variant='outline'
              className='w-full bg-transparent'
            >
              Voltar ao Início
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function PhaseResultPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center'>
          <p>Carregando...</p>
        </div>
      }
    >
      <PhaseResultContent />
    </Suspense>
  )
}
