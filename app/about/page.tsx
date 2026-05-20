import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, Target, Clock, Trophy, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className='min-h-screen p-4'>
      <div className='max-w-2xl mx-auto py-8'>
        <Link href='/inicio'>
          <Button variant='ghost' className='mb-6'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Voltar
          </Button>
        </Link>

        <Card className='p-8 bg-card border-2 border-border shadow-xl'>
          <h1 className='text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
            Sobre o Jogo
          </h1>

          <div className='space-y-6 text-foreground'>
            <div>
              <h2 className='text-2xl font-bold mb-3 text-foreground'>
                Objetivo
              </h2>
              <p className='text-muted-foreground leading-relaxed'>
                O <b>CicatriGame</b> é um aplicativo educacional gamificado que
                testa seus conhecimentos através de 6 fases. Cada fase apresenta
                desafios únicos com perguntas de múltipla escolha, onde você
                precisa demonstrar domínio do cateter venoso central de inserção
                periférica.
              </p>
            </div>

            <div className='grid gap-4 mt-6'>
              <div className='flex gap-4 p-4 bg-muted rounded-xl'>
                <div className='flex-shrink-0'>
                  <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center'>
                    <Target className='h-6 w-6 text-white' />
                  </div>
                </div>
                <div>
                  <h3 className='font-bold text-foreground mb-1'>
                    Meta de Aprovação
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Acerte no mínimo 60% das questões em cada fase para avançar
                    para a próxima.
                  </p>
                </div>
              </div>

              <div className='flex gap-4 p-4 bg-muted rounded-xl'>
                <div className='flex-shrink-0'>
                  <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center'>
                    <Clock className='h-6 w-6 text-white' />
                  </div>
                </div>
                <div>
                  <h3 className='font-bold text-foreground mb-1'>
                    Tempo Limitado
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Você tem apenas 30 segundos para responder cada pergunta.
                    Pense rápido!
                  </p>
                </div>
              </div>

              <div className='flex gap-4 p-4 bg-muted rounded-xl'>
                <div className='flex-shrink-0'>
                  <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center'>
                    <Zap className='h-6 w-6 text-white' />
                  </div>
                </div>
                <div>
                  <h3 className='font-bold text-foreground mb-1'>6 Fases</h3>
                  <p className='text-sm text-muted-foreground'>
                    Cada fase aborda um tema específico: definição do cateter
                    CicatriGame, indicações para inserção, técnica de passagem,
                    cuidados de manutenção, Fisiologia Vascular e critérios para remoção.
                  </p>
                </div>
              </div>

              <div className='flex gap-4 p-4 bg-muted rounded-xl'>
                <div className='flex-shrink-0'>
                  <div className='w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center'>
                    <Trophy className='h-6 w-6 text-white' />
                  </div>
                </div>
                <div>
                  <h3 className='font-bold text-foreground mb-1'>
                    Certificado de Conclusão
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Complete todas as fases com sucesso e receba um certificado
                    em PDF!
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-8 p-6 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl border-2 border-primary/20'>
              <h3 className='font-bold text-lg text-primary mb-2'>
                Regras Importantes
              </h3>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <span className='text-primary font-bold'>•</span>
                  <span>
                    Se não responder a tempo, a questão é contada como incorreta
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary font-bold'>•</span>
                  <span>
                    Se não atingir 60% em uma fase, o jogo reinicia desde a Fase
                    1
                  </span>
                </li>
                <li className='flex items-start gap-2'>
                  <span className='text-primary font-bold'>•</span>
                  <span>
                    Cada fase tem uma cor temática única para melhor
                    identificação
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
