'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Timer } from '../../components/timer'
import { PhaseBadge } from '../../components/phase-badge'
import { useRouter } from 'next/navigation'
import { saveProgress, getProgress } from '../../lib/game-storage'
import {
  calculatePercentage,
  hasPassedPhase,
  getPhaseColorClass,
  shuffleQuestion,
} from '../../lib/game-logic'
import type { GameData, Phase, Question } from '../../lib/game-logic'
import questionsData from '../../data/questions.json'
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react'

export default function GamePage() {
  const router = useRouter()
  const [gameData] = useState<GameData>(questionsData as GameData)
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [phaseAnswers, setPhaseAnswers] = useState<boolean[]>([])
  const [allPhaseScores, setAllPhaseScores] = useState<number[]>([])
  const [allPhaseAnswers, setAllPhaseAnswers] = useState<boolean[][]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([])
  const [shuffledCorrectAnswer, setShuffledCorrectAnswer] = useState<number>(-1)
  const [timerKey, setTimerKey] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [showingQuestion, setShowingQuestion] = useState(true)

  const currentPhase: Phase = gameData.phases[currentPhaseIndex] || gameData.phases[0]
  const currentQuestion: Question = currentPhase?.questions?.[currentQuestionIndex] || currentPhase?.questions?.[0]
  const totalQuestions = currentPhase?.questions?.length || 0

  useEffect(() => {
    const savedProgress = getProgress()
    if (savedProgress) {
      const validPhaseIndex = Math.min(
        savedProgress.currentPhase,
        gameData.phases.length - 1
      )
      const validQuestionIndex = Math.min(
        savedProgress.currentQuestion,
        gameData.phases[validPhaseIndex]?.questions?.length - 1 || 0
      )
      
      setCurrentPhaseIndex(Math.max(0, validPhaseIndex))
      setCurrentQuestionIndex(Math.max(0, validQuestionIndex))
      setPhaseAnswers(savedProgress.phaseAnswers || [])
      setAllPhaseScores(savedProgress.allPhaseScores || [])
      setAllPhaseAnswers(savedProgress.allPhaseAnswers || [])
    }

    // Reset da interface para a pergunta atual
    setSelectedAnswer(null)
    setShowFeedback(false)
    setShowingQuestion(true)
    setIsTimerActive(false)
    setTimerKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (
      currentPhaseIndex > 0 ||
      currentQuestionIndex > 0 ||
      phaseAnswers.length > 0
    ) {
      saveProgress({
        currentPhase: currentPhaseIndex,
        currentQuestion: currentQuestionIndex,
        phaseAnswers,
        allPhaseScores,
        allPhaseAnswers,
      })
    }
  }, [currentPhaseIndex, currentQuestionIndex, phaseAnswers, allPhaseScores, allPhaseAnswers])

  useEffect(() => {
    if (!currentQuestion) return

    const { shuffledOptions, shuffledCorrectAnswer } = shuffleQuestion(currentQuestion)

    setShuffledOptions(shuffledOptions)
    setShuffledCorrectAnswer(shuffledCorrectAnswer)

    // Reset UI for new question
    setSelectedAnswer(null)
    setShowFeedback(false)
    setShowingQuestion(true)
    setIsTimerActive(false)
    setTimerKey((prev) => prev + 1)
  }, [currentQuestion])

  const handleAnswer = useCallback(
    (answerIndex: number) => {
      if (showFeedback) return

      setIsTimerActive(false)
      setSelectedAnswer(answerIndex)
      const correct = answerIndex === shuffledCorrectAnswer
      setIsCorrect(correct)
      setShowFeedback(true)

      // Substituir na posição correta ao invés de sempre adicionar ao final
      const newPhaseAnswers = [...phaseAnswers]
      newPhaseAnswers[currentQuestionIndex] = correct
      setPhaseAnswers(newPhaseAnswers)

      setTimeout(() => {
        const savedProgress = getProgress()
        const previousAllPhaseScores = savedProgress?.allPhaseScores || allPhaseScores || []
        const previousAllPhaseAnswers = savedProgress?.allPhaseAnswers || allPhaseAnswers || []
        
        // Salvar progresso da pergunta respondida
        const updatedProgress = {
          currentPhase: currentPhaseIndex,
          currentQuestion: Math.min(currentQuestionIndex + 1, Math.max(totalQuestions - 1, 0)),
          phaseAnswers: newPhaseAnswers,
          allPhaseScores: previousAllPhaseScores,
          allPhaseAnswers: previousAllPhaseAnswers,
        }

        // Se completou a fase atual (todas as perguntas respondidas)
        const isPhaseComplete =
          totalQuestions > 0 &&
          Array.from({ length: totalQuestions }).every(
            (_, questionIndex) => newPhaseAnswers[questionIndex] !== undefined
          )

        if (isPhaseComplete) {
          const correctAnswers = newPhaseAnswers.filter((a) => a).length
          const percentage = calculatePercentage(correctAnswers, totalQuestions)
          const passed = hasPassedPhase(percentage)
          const newAllPhaseScores = [...previousAllPhaseScores]
          newAllPhaseScores[currentPhaseIndex] = percentage

          // Salvar as respostas desta fase
          const newAllPhaseAnswers = [...previousAllPhaseAnswers]
          newAllPhaseAnswers[currentPhaseIndex] = newPhaseAnswers

          updatedProgress.allPhaseScores = newAllPhaseScores
          updatedProgress.allPhaseAnswers = newAllPhaseAnswers
          updatedProgress.phaseAnswers = [] // Reset para próxima fase
          updatedProgress.currentQuestion = 0

          // Atualizar estado React para manter sincronizado
          setAllPhaseScores(newAllPhaseScores)
          setAllPhaseAnswers(newAllPhaseAnswers)

          saveProgress(updatedProgress)
          router.push(
            `/phase-result?phase=${currentPhaseIndex + 1}&percentage=${percentage}&passed=${passed}`
          )
          return
        }

        saveProgress(updatedProgress)

        router.push('/phase-selection')
      }, 1500)
    },
    [
      showFeedback,
      shuffledCorrectAnswer,
      currentQuestion,
      phaseAnswers,
      currentQuestionIndex,
      totalQuestions,
      currentPhaseIndex,
      allPhaseScores,
      allPhaseAnswers,
      router,
    ]
  )

  const handleTimeout = useCallback(() => {
    if (!showFeedback) {
      // Marcar como resposta incorreta (-1) quando o tempo esgotar
      handleAnswer(-1)
    }
  }, [showFeedback, handleAnswer])

  const handleStartAnswering = () => {
    setShowingQuestion(false)
    setIsTimerActive(true)
  }

  const imageSrc = showFeedback
    ? isCorrect
      ? '/feliz.png'
      : '/contentamento.png'
    : showingQuestion
    ? '/explicando.png'
    : '/pensando.png'
  const imageAlt = showFeedback
    ? isCorrect
      ? 'Resposta correta'
      : 'Resposta incorreta'
    : showingQuestion
    ? 'Lendo a pergunta'
    : 'Pensando na resposta'

  if (!currentPhase || !currentQuestion) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p>Carregando...</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen p-4' style={{ minHeight: '100dvh' }}>
      <div className='max-w-2xl mx-auto py-8'>
        <Card className='p-4 md:p-8 bg-card/95 backdrop-blur-sm border-2 border-border shadow-2xl'>
          <div className='flex items-center justify-between gap-3'>
            <PhaseBadge
              phaseNumber={currentPhase.id}
              phaseName={currentPhase.name}
              phaseColor={currentPhase.color}
            />

            <div className='flex-1 min-w-0'>
                    <div>
        <h2 className="text-xl font-bold text-foreground">{currentPhase.name.split(" - ")[1]}</h2>
      </div>
              <p className='text-xs text-muted-foreground font-medium mb-1.5'>
                Missão {currentQuestionIndex + 1}/{totalQuestions}
              </p>
              <div className='flex gap-1'>
                {Array.from({ length: totalQuestions }).map((_, idx) => {
                  // Usar allPhaseAnswers se a fase já foi completada, senão usar phaseAnswers atual
                  const isPhaseCompleted = allPhaseScores[currentPhaseIndex] !== undefined
                  const answerResult = isPhaseCompleted 
                    ? allPhaseAnswers[currentPhaseIndex]?.[idx]
                    : phaseAnswers[idx]
                  
                  return (
                    <div
                      key={idx}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        idx < currentQuestionIndex
                          ? answerResult
                            ? 'bg-success'
                            : 'bg-error'
                          : idx === currentQuestionIndex
                          ? 'bg-primary'
                          : 'bg-muted'
                      }`}
                    />
                  )
                })}
              </div>
            </div>
          </div>

          {!showingQuestion && (
            <Timer
              key={timerKey}
              duration={15}
              onTimeout={handleTimeout}
              isActive={isTimerActive}
            />
          )}

          <div className='mb-2'>
            {showingQuestion && (
              <div className='relative w-fit mx-auto'>
                <div className='p-6 flex items-center justify-center bg-black/10 rounded-2xl'>
                  <h2 className='text-2xl md:text-3xl font-medium text-center text-foreground leading-tight text-balance'>
                    {currentQuestion.question}
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
            )}
            <div className='w-full flex mt-4 mb-8'>
              <div className='relative h-72 w-44 shrink-0'>
                <div
                  className='pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 w-7/12 h-3 md:h-4 rounded-full bg-black/30 blur-md md:blur-lg'
                  aria-hidden='true'
                />
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  priority
                  className='object-contain'
                />
              </div>
            </div>
            {showingQuestion ? (
              <div className='flex justify-center'>
                <Button
                  onClick={handleStartAnswering}
                  size='lg'
                  className='text-lg font-bold px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105'
                >
                  Responder
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                {(shuffledOptions.length > 0 ? shuffledOptions : currentQuestion.options).map((option: string, index: number) => {
                  const isSelected = selectedAnswer === index
                  const isCorrectAnswer = index === shuffledCorrectAnswer
                  const showCorrect = showFeedback && isCorrectAnswer
                  const showWrong = showFeedback && isSelected && !isCorrect

                  return (
                    <Button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={showFeedback}
                      className={`w-full h-auto min-h-16 text-base font-medium p-4 transition-all duration-300 whitespace-normal ${
                        showCorrect
                          ? 'bg-success hover:bg-success text-white border-success'
                          : showWrong
                          ? 'bg-error hover:bg-error text-white border-error'
                          : 'bg-background hover:bg-muted text-foreground border-2 border-border'
                      } ${showFeedback ? 'cursor-not-allowed' : ''}`}
                      variant='outline'
                    >
                      <div className='flex items-start justify-between w-full gap-3'>
                        <span className='flex-1 text-left leading-snug'>{option}</span>
                        {showCorrect && (
                          <CheckCircle2 className='h-6 w-6 shrink-0 mt-0.5' />
                        )}
                        {showWrong && (
                          <XCircle className='h-6 w-6 shrink-0 mt-0.5' />
                        )}
                      </div>
                    </Button>
                  )
                })}
              </div>
            )}
          </div>

          <div className='text-center text-xs text-muted-foreground font-medium'>
            Referência: {currentQuestion.reference}
          </div>
        </Card>
      </div>
    </div>
  )
}
