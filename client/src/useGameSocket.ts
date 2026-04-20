import { useEffect, useRef, useCallback, useState } from 'react';
import { wsUrl } from './api';

type MessageHandler = (data: unknown) => void;

export default function useGameSocket(token: string | null, onMessage?: MessageHandler) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const url = wsUrl(token);
    console.log('[WS] connecting to:', url);
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] connected');
      setConnected(true);
    };

    ws.onerror = (err) => {
      console.error('[WS] error:', err);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onMessage?.(data);
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      // Only clear if this is still the active socket (StrictMode can cause stale closes)
      if (wsRef.current === ws) {
        setConnected(false);
        wsRef.current = null;
      }
    };

    return () => {
      ws.close();
    };
  }, [token, onMessage]);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const msg = JSON.stringify(data);
      console.log('[WS] sending:', msg);
      wsRef.current.send(msg);
    } else {
      console.warn('[WS] send failed, readyState:', wsRef.current?.readyState ?? 'no socket');
    }
  }, []);

  return { send, connected };
}
