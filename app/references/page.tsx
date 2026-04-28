import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'
import questionsData from '@/data/questions.json'

export default function ReferencesPage() {
  const references = Array.from(
    new Set(
      questionsData.phases.flatMap((phase) =>
        phase.questions
          .map((question) => question.reference?.trim())
          .filter((reference) => Boolean(reference))
      )
    )
  )

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
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center'>
              <BookOpen className='h-6 w-6 text-white' />
            </div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
              Referências
            </h1>
          </div>

          <div className='space-y-4'>
            <p className='text-muted-foreground leading-relaxed'>
              Estas referências correspondem às fontes utilizadas para criar o
              conteúdo do jogo e servir de base para as perguntas.
            </p>

            <div className='mt-8 p-6 bg-muted rounded-xl space-y-4'>
              {references.length > 0 ? (
                <ol className='space-y-4 list-decimal list-inside'>
                  {references.map((reference, index) => (
                    <li
                      key={`${index}-${reference}`}
                      className='text-sm text-muted-foreground italic leading-relaxed'
                    >
                      {reference}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className='text-sm text-muted-foreground italic'>
                  Nenhuma referência encontrada no banco de perguntas.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
