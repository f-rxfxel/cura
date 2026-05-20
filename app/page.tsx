import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { Quicksand, Rubik } from 'next/font/google'

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

export default function IntroPage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <Card className='w-full max-w-2xl p-8 md:p-10 bg-card border-2 border-border shadow-2xl'>
        <div className='space-y-8'>
          <div className='text-center my-4 animate-slide-up'>
            <img
              src='/logo.png'
              alt='Logo CicatriGame'
              className='mx-auto w-32 h-32 object-contain mb-4'
            />
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent blur-3xl opacity-30 animate-pulse-glow' />
              <h1
                className={`text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent relative ${quicksand.className}`}
              >
                CicatriGame
              </h1>
            </div>
            <p className={`text-muted-foreground text-xl ${rubik.className}`}>
              Limpeza Segura de Feridas
            </p>
          </div>

          <div className='text-center space-y-1'>
            <p className='text-base md:text-lg text-foreground font-medium'>Leidiane Aparecida Costa dos Santos</p>
            <p className='text-base md:text-lg text-foreground font-medium'>Geraldo Magela Salomé</p>
          </div>

          <div className='flex items-center justify-center gap-8 md:gap-12'>
            <Image
              src='/Fapemig.png'
              alt='Logo Mestrado'
              width={120}
              height={72}
              className='object-contain'
            />
            <Image
              src='/logo-univas.png'
              alt='Logo UNIVAS'
              width={120}
              height={72}
              className='object-contain'
            />
          </div>

          <div className='flex justify-center'>
            <Link href='/inicio'>
              <Button size='lg' className='px-10'>Entrar</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}
