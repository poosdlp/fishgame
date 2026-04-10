import { useState, useEffect } from 'react';
import { apiUrl } from './api';

export default function VerifyEmail() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    fetch(apiUrl(`/api/auth/verify-email?token=${encodeURIComponent(token)}`), {
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setStatus('error');
        setMessage('Network error. Please try again.');
      });

    return () => controller.abort();
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Email Verification</h2>
        {status === 'loading' && <p>Verifying your email...</p>}
        {status === 'success' && (
          <>
            <p className="message">{message}</p>
            <a href="/">Go to Login</a>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="message">{message}</p>
            <a href="/">Go to Login</a>
          </>
        )}
      </div>
    </div>
  );
}
