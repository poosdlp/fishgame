import { createContext, useContext, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './AuthContext'
import useGameSocket from './useGameSocket'

type MessageListener = (data: unknown) => void

interface SocketContextValue {
  send: (data: unknown) => void
  connected: boolean
  subscribe: (listener: MessageListener) => () => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket must be used within SocketProvider')
  return ctx
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const listenersRef = useRef<Set<MessageListener>>(new Set())

  const handleMessage = useCallback((data: unknown) => {
    for (const listener of listenersRef.current) {
      listener(data)
    }
  }, [])

  const { send, connected } = useGameSocket(token, handleMessage)

  const subscribe = useCallback((listener: MessageListener) => {
    listenersRef.current.add(listener)
    return () => { listenersRef.current.delete(listener) }
  }, [])

  return (
    <SocketContext.Provider value={{ send, connected, subscribe }}>
      {children}
    </SocketContext.Provider>
  )
}
