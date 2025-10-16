'use client'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { useTheme } from '@/store/theme'

interface LayoutWithSidebarProps {
  children: React.ReactNode
}

export default function LayoutWithSidebar({ children }: LayoutWithSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { getEffectiveTheme } = useTheme()

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  useEffect(() => {
    const effectiveTheme = getEffectiveTheme()
    document.documentElement.setAttribute('data-theme', effectiveTheme)
  }, [getEffectiveTheme])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <main className="flex-1 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}
