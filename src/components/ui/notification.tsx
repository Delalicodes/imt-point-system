"use client"

import { useEffect } from "react"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

interface NotificationProps {
  type: 'success' | 'error' | null
  message: string
  onClose?: () => void
}

export function Notification({ type, message, onClose }: NotificationProps) {
  useEffect(() => {
    if (type && onClose) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [type, onClose])

  if (!type || !message) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-3">
      <div
        className={`flex items-center gap-2 rounded-lg px-4 py-2 shadow-lg ${
          type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}
      >
        {type === 'success' ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  )
}
