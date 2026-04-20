import { useState, useEffect, useRef, useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import QRCodeImport from 'react-qr-code';
const QRCode = (QRCodeImport as any).default || QRCodeImport;
import { apiUrl } from './api';

interface AuthProps {
  onLogin: (token: string) => void;
}

const POLL_INTERVAL_MS = 2000;
const SHOW_LOGIN_BYPASS = import.meta.env.DEV && import.meta.env.VITE_ENABLE_LOGIN_BYPASS !== 'false';
const LOGIN_BYPASS_TOKEN = import.meta.env.VITE_BYPASS_ACCESS_TOKEN || 'dev-login-bypass';

export default function Auth({ onLogin }: AuthProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'pending' | 'expired' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const didAutoCreateRef = useRef(false);

  const createSession = useCallback(async () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }

    setSessionId(null);
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch(apiUrl('/api/session/create'), {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to create session');
      const data = await response.json();
      setSessionId(data.sessionId);
      setStatus('pending');
    } catch {
      setStatus('error');
      setMessage('Failed to create session');
    }
  }, []);

  useEffect(() => {
    if (didAutoCreateRef.current) return;
    didAutoCreateRef.current = true;
    void createSession();
  }, [createSession]);

  useEffect(() => {
    if (status !== 'pending' || !sessionId) return;

    pollRef.current = setInterval(async () => {
      try {
        const response = await fetch(apiUrl(`/api/session/${sessionId}/status`), {
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Poll failed');
        const data = await response.json();

        if (data.status === 'approved' && data.accessToken) {
          if (pollRef.current) clearInterval(pollRef.current);
          onLogin(data.accessToken);
        } else if (data.status === 'expired') {
          if (pollRef.current) clearInterval(pollRef.current);
          setStatus('expired');
        }
      } catch {
        // keep polling on transient errors
      }
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [status, sessionId, onLogin]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>

        {SHOW_LOGIN_BYPASS && (
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <button onClick={() => onLogin(LOGIN_BYPASS_TOKEN)}>Bypass login (dev)</button>
          </div>
        )}

        {status === 'loading' && <p style={{ textAlign: 'center' }}>Creating session...</p>}

        {status === 'pending' && sessionId && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <p>Scan this QR code with the mobile app to log in</p>
            <div style={{ background: 'white', padding: '16px', borderRadius: '8px' }}>
              <QRCode value={sessionId} size={200} />
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Waiting for approval...</p>
          </div>
        )}

        {status === 'expired' && (
          <div style={{ textAlign: 'center' }}>
            <p>Session expired</p>
            <button onClick={createSession}>Generate new QR code</button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center' }}>
            <p>{message}</p>
            <button onClick={createSession}>Try again</button>
          </div>
        )}
      </div>
    </div>
  );
}