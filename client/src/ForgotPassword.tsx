import { useState } from 'react';
import { apiUrl } from './api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(apiUrl('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'Check your email for reset instructions.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        {status === 'success' ? (
          <>
            <p className="message">{message}</p>
            <a href="/">Back to Login</a>
          </>
        ) : (
          <>
            <p>Enter your email and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            {message && <p className="message">{message}</p>}
            <div className="auth-toggle">
              <a href="/">Back to Login</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
