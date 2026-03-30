import { useState, useCallback, createContext, useContext, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

// This file was written by AI

interface Notification {
  id: string
  message: string
  type: 'info' | 'success' | 'error'
}

interface NotificationContextType {
  notify: (message: string, type?: Notification['type']) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotification() {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotification must be used within NotificationProvider')
  return ctx
}

let notifCounter = 0

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const notify = useCallback((message: string, type: Notification['type'] = 'info') => {
    const id = `notif_${notifCounter++}`
    setNotifications((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    }, 3000)
  }, [])

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`rounded-lg px-4 py-2 text-sm shadow-lg ${
                n.type === 'success'
                  ? 'bg-green-600 text-white'
                  : n.type === 'error'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-white'
              }`}
            >
              {n.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}
