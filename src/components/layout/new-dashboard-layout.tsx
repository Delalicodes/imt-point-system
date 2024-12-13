'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home,
  Settings,
  UserCog,
  GraduationCap,
  MessageSquare,
  Award,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  UserPlus,
  BookOpen,
  Users
} from 'lucide-react'
import Image from 'next/image'

interface MenuItem {
  name: string
  href: string
  icon: any
  submenu?: MenuItem[]
}

const menuItems: MenuItem[] = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Registration', href: '/dashboard/registration', icon: UserPlus },
  { 
    name: 'Setups', 
    href: '#',
    icon: Settings,
    submenu: [
      { name: 'Course Setup', href: '/dashboard/setups/course-setup', icon: BookOpen },
      { name: 'Supervisor Setup', href: '/dashboard/setups/supervisor-setup', icon: UserCog }
    ]
  },
  { name: 'Assign Supervisor', href: '/dashboard/setups/supervisor-assignment', icon: Users },
  { name: 'Students', href: '/dashboard/students', icon: GraduationCap },
  { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { name: 'Points', href: '/dashboard/points', icon: Award },
]

export default function NewDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const toggleSubmenu = useCallback((menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }, [])

  const isSubmenuExpanded = (menuName: string) => expandedMenus.includes(menuName)

  const isActiveLink = (href: string, submenu?: MenuItem[]) => {
    if (href === '#') {
      return submenu?.some(item => pathname === item.href)
    }
    if (href === '/dashboard') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="flex pt-16 bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col h-[calc(100vh-4rem)] fixed left-0 top-16`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {isSidebarOpen && (
              <div className="flex items-center">
                <Image
                  src="/images/it-education-logo.svg"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="mr-2"
                />
                <span className="font-semibold">IMT Points</span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          {menuItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0
            const isActive = isActiveLink(item.href, item.submenu)
            const isExpanded = isSubmenuExpanded(item.name)

            return (
              <div key={item.href} className="relative">
                {hasSubmenu ? (
                  <>
                    <div
                      className={`flex items-center px-4 py-3 ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      } transition-colors duration-200 cursor-pointer`}
                      onClick={() => isSidebarOpen && toggleSubmenu(item.name)}
                    >
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`} />
                      {isSidebarOpen && (
                        <>
                          <span className="flex-1">{item.name}</span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </>
                      )}
                    </div>
                    {isSidebarOpen && isExpanded && (
                      <div className="pl-4">
                        {item.submenu?.map((subItem) => (
                          <Link
                            key={subItem.href}
                            href={subItem.href}
                            className={`flex items-center px-4 py-2 ${
                              pathname === subItem.href
                                ? 'text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <subItem.icon className="h-4 w-4 mr-3" />
                            <span>{subItem.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    } transition-colors duration-200`}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isSidebarOpen ? 'mr-3' : ''}`} />
                    {isSidebarOpen && <span>{item.name}</span>}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 overflow-auto p-8 ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {children}
      </main>
    </div>
  )
}
