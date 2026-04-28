'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Play, BookOpen, Info, Trophy, ChevronLeft, ChevronRight } from 'lucide-react'
import { Quicksand, Rubik } from 'next/font/google'
import Image from 'next/image'

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
})

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
})

const tutorialSteps = [
  {
    text: "Olá! Sou a enfermeira Maria e vou te guiar nesta jornada de aprendizado sobre o CURA!",
    image: "/explicando.png"
  },
  {
    text: "O jogo é dividido em 6 fases, cada uma com várias missões. Complete as missões para avançar!",
    image: "/explicando2.png"
  },
  {
    text: "Responda corretamente às perguntas para ganhar pontos. Você precisa de 60% de acerto para passar de fase.",
    image: "/explicando.png"
  },
  {
    text: "Boa sorte! Vamos começar sua jornada de conhecimento sobre o CURA!",
    image: "/feliz.png"
  }
]

const imageSrc = '/explicando.png'

export default function HomePage() {
  const [showTutorial, setShowTutorial] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const handleStartGame = () => {
    setShowTutorial(true)
    setCurrentStep(0)
  }

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      router.push('/phase-selection')
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      setShowTutorial(false)
    }
  }

  if (showTutorial) {
    return (
      <div className='min-h-screen flex items-center justify-center p-4'>
        <Card className='w-full max-w-2xl p-8 bg-card border-2 border-border shadow-2xl'>
          <div className='space-y-6'>
            <div className='mb-2'>
              <div className='relative w-fit mx-auto'>
                <div className='p-6 flex items-center justify-center bg-black/10 rounded-2xl'>
                  <h2 className='text-2xl md:text-3xl font-medium text-center text-foreground leading-tight text-balance'>
                    {tutorialSteps[currentStep].text}
                  </h2>
                </div>
                <div
                  className='absolute -bottom-4 left-28 w-0 h-0 z-10'
                  style={{
                    borderRight: '16px solid transparent',
                    borderLeft: '0 solid transparent',
                    borderTop: '16px solid #0000001a',
                  }}
                />
              </div>
              <div className='w-full flex mt-4 mb-8'>
                <div className='relative h-72 w-44 flex-shrink-0'>
                  <div
                    className='pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 w-7/12 h-3 md:h-4 rounded-full bg-black/30 blur-md md:blur-lg'
                    aria-hidden='true'
                  />
                  <Image
                    src={tutorialSteps[currentStep].image}
                    alt={'Enfermeira Maria'}
                    fill
                    priority
                    className='object-contain'
                  />
                </div>
              </div>
            </div>

            <div className='flex justify-center gap-2'>
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-8 rounded-full transition-all ${index === currentStep ? 'bg-primary' : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>

            <div className='flex justify-between items-center gap-4'>
              <Button
                variant='outline'
                onClick={handlePrevStep}
                className='flex items-center gap-2'
              >
                <ChevronLeft className='h-4 w-4' />
                Voltar
              </Button>

              <Button
                onClick={handleNextStep}
                className='flex items-center gap-2 bg-gradient-to-r from-primary to-secondary'
              >
                {currentStep === tutorialSteps.length - 1 ? 'Começar!' : 'Próximo'}
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <Card className='w-full max-w-md p-8 bg-card border-2 border-border shadow-2xl'>
        <div className='text-center my-4 animate-slide-up'>
          <img
            src='/logo.png'
            alt='Logo CURA'
            className='mx-auto w-32 h-32 object-contain mb-4'
          />
          <div className='relative'>
            <div className='absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent blur-3xl opacity-30 animate-pulse-glow' />
            <h1
              className={`text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent relative ${quicksand.className}`}
            >
              CURA
            </h1>
          </div>
          <p className={`text-muted-foreground text-xl ${rubik.className}`}>
            Aprenda a Cuidar de Feridas
          </p>
        </div>

        <div className='space-y-3 animate-bounce-in'>
          <Button
            size='lg'
            onClick={handleStartGame}
            className='w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity text-lg font-bold h-14 shadow-lg'
          >
            <Play className='mr-2 h-5 w-5' />
            Iniciar Jogo
          </Button>

          <Link href='/references' className='block'>
            <Button
              size='lg'
              variant='outline'
              className='w-full border-1 border-secondary hover:bg-muted text-lg font-semibold h-12 bg-transparent text-primary'
            >
              <BookOpen className='mr-2 h-5 w-5' />
              Referências
            </Button>
          </Link>

          <Link href='/about' className='block'>
            <Button
              size='lg'
              variant='outline'
              className='w-full border-1 border-secondary hover:bg-muted text-lg font-semibold h-12 bg-transparent text-primary'
            >
              <Info className='mr-2 h-5 w-5' />
              Sobre o Jogo
            </Button>
          </Link>

          <Link href='/leaderboard' className='block'>
            <Button
              size='lg'
              variant='outline'
              className='w-full border-1 border-secondary hover:bg-muted text-lg font-semibold h-12 bg-transparent text-primary'
            >
              <Trophy className='mr-2 h-5 w-5' />
              Placar
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
