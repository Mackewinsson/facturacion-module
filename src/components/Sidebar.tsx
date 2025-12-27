'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import ThemeToggle from './ThemeToggle'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

// Icon components
const HomeIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg className={`${isCollapsed ? "w-8 h-8" : "w-5 h-5"} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

const InvoiceIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg className={`${isCollapsed ? "w-8 h-8" : "w-5 h-5"} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const EntitiesIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg className={`${isCollapsed ? "w-8 h-8" : "w-5 h-5"} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
)

const PaymentsIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg className={`${isCollapsed ? "w-8 h-8" : "w-5 h-5"} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ConfigIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg className={`${isCollapsed ? "w-8 h-8" : "w-5 h-5"} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const LogoutIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg className={`${isCollapsed ? "w-8 h-8" : "w-5 h-5"} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const logout = useAuthStore((state) => state.logout)

  const menuItems = [
    {
      name: 'Inicio',
      href: '/',
      icon: HomeIcon,
      active: pathname === '/'
    },
    {
      name: 'Facturas',
      href: '/facturacion',
      icon: InvoiceIcon,
      active: pathname.startsWith('/facturacion'),
      submenu: [
        {
          name: 'Emitidas',
          href: '/facturacion',
          active: pathname === '/facturacion' || pathname.startsWith('/facturacion/nueva')
        },
        {
          name: 'Recibidas',
          href: '/facturacion/recibidas',
          active: pathname.startsWith('/facturacion/recibidas')
        }
      ]
    },
    {
      name: 'Entidades',
      href: '/entidades',
      icon: EntitiesIcon,
      active: pathname.startsWith('/entidades')
    },
    {
      name: 'Pagos',
      href: '/pagos',
      icon: PaymentsIcon,
      active: pathname.startsWith('/pagos')
    },
    {
      name: 'Configuración',
      href: '/configuracion',
      icon: ConfigIcon,
      active: pathname.startsWith('/configuracion')
    }
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className={`bg-sidebar text-sidebar-foreground transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col h-screen sticky top-0`}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-muted">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold">Nibisoft</h1>
          )}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-sidebar-accent transition-colors"
              title={isCollapsed ? 'Expandir sidebar' : 'Contraer sidebar'}
            >
              <svg
                className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center p-3 rounded-md ${
                    item.active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.name : ''}
                >
                  <IconComponent isCollapsed={isCollapsed} />
                  {!isCollapsed && (
                    <span className="ml-3 font-medium">{item.name}</span>
                  )}
                </Link>
                {/* Submenu */}
                {!isCollapsed && item.submenu && (
                  <ul className="ml-8 mt-2 space-y-1">
                    {item.submenu.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.href}
                          className={`block px-3 py-2 text-sm rounded-md ${
                            subItem.active
                              ? 'bg-sidebar-accent/50 text-sidebar-accent-foreground'
                              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/30 hover:text-sidebar-foreground'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-muted">
        <button
          onClick={handleLogout}
          className={`flex items-center w-full p-3 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? 'Cerrar sesión' : ''}
        >
          <LogoutIcon isCollapsed={isCollapsed} />
          {!isCollapsed && (
            <span className="ml-3 font-medium">Cerrar Sesión</span>
          )}
        </button>
      </div>
    </div>
  )
}
