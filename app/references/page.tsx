import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'

export default function ReferencesPage() {
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
              <ol className='space-y-4 list-decimal list-inside'>
                <li className='text-sm text-muted-foreground italic leading-relaxed'>
                  Ringblom et al., 2024. <strong>Wound cleansing solutions versus normal saline in diabetic foot ulcers – systematic review.</strong> Mostra que soro fisiológico ainda é a solução padrão por segurança e custo.
                </li>

                <li className='text-sm text-muted-foreground italic leading-relaxed'>
                  Watson et al., 2024. <strong>Comparison of antimicrobial efficacy of wound cleansing solutions focusing on PHMB.</strong> Demonstra alta eficácia do PHMB contra biofilme.
                </li>

                <li className='text-sm text-muted-foreground italic leading-relaxed'>
                  Liu et al., 2024. <strong>Ultrasound-assisted wound debridement in diabetic foot ulcers – systematic review.</strong> Mostra que desbridamento por ultrassom melhora cicatrização.
                </li>

                <li className='text-sm text-muted-foreground italic leading-relaxed'>
                  Rajhathy & LeBlanc, 2024. <strong>Debridement: Canadian Best Practice Recommendations for Nurses.</strong> Diretrizes internacionais para desbridamento realizado por enfermeiros.
                </li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
