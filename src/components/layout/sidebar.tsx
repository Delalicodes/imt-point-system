"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Users,
  Settings,
  UserCog,
  GraduationCap,
  MessageSquare,
  Award,
  ChevronDown,
  UserPlus,
  Home,
  BookOpen
} from 'lucide-react'

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

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>([])
  const pathname = usePathname()

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuName) 
        ? prev.filter(name => name !== menuName)
        : [...prev, menuName]
    )
  }

  const isSubmenuExpanded = (menuName: string) => expandedMenus.includes(menuName)

  return (
    <nav className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-gray-200 bg-white">
      <div className="flex flex-col h-full p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const hasSubmenu = item.submenu && item.submenu.length > 0
            const isActive = pathname === item.href || 
              (hasSubmenu && item.submenu?.some(sub => pathname === sub.href))
            const isExpanded = isSubmenuExpanded(item.name)

            return (
              <div key={item.href} className="relative">
                {hasSubmenu ? (
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer',
                      'hover:bg-gray-100',
                      isActive ? 'bg-gray-100' : ''
                    )}
                    onClick={() => toggleSubmenu(item.name)}
                  >
                    <item.icon size={20} />
                    <span className="flex-1">{item.name}</span>
                    <ChevronDown
                      size={16}
                      className={cn(
                        'transition-transform',
                        isExpanded ? 'rotate-180' : ''
                      )}
                    />
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer',
                      'hover:bg-gray-100',
                      isActive ? 'bg-gray-100' : ''
                    )}
                  >
                    <item.icon size={20} />
                    <span className="flex-1">{item.name}</span>
                  </Link>
                )}
                {hasSubmenu && isExpanded && (
                  <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-1 py-1 z-10">
                    {item.submenu?.map(subItem => (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2 transition-colors',
                          'hover:bg-gray-100',
                          pathname === subItem.href ? 'bg-gray-100' : ''
                        )}
                      >
                        <subItem.icon size={20} />
                        <span>{subItem.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
