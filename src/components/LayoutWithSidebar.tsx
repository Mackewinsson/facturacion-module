'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'

interface LayoutWithSidebarProps {
  children: React.ReactNode
}

export default function LayoutWithSidebar({ children }: LayoutWithSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} onToggle={toggleSidebar} />
      <main className="flex-1 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  )
}
