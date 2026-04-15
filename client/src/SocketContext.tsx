import { createContext, useContext, useCallback } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import useGameSocket from './useGameSocket'

interface SocketContextValue {
  send: (data: unknown) => void
  connected: boolean
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}

export function SocketProvider({ onMessage, children }: { onMessage?: (data: unknown) => void; children: ReactNode }) {
  const { token } = useAuth()
  const stableOnMessage = useCallback((data: unknown) => {
    onMessage?.(data)
  }, [onMessage])

  const { send, connected } = useGameSocket(token, stableOnMessage)

  return (
    <SocketContext.Provider value={{ send, connected }}>
      {children}
    </SocketContext.Provider>
  )
}
