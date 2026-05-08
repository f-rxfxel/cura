"use client"
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export default function MenuBackground() {
  const pathname = usePathname() ?? '/'

  useEffect(() => {
    const menuPaths = ['/', '/inicio', '/about', '/leaderboard']
    const isMenu = menuPaths.some(
      (p) => pathname === p || pathname.startsWith(p + '/')
    )

    if (isMenu) document.body.classList.add('menu-bg')
    else document.body.classList.remove('menu-bg')

    return () => {
      document.body.classList.remove('menu-bg')
    }
  }, [pathname])

  return null
}
