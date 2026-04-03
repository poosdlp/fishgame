import { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import { apiUrl } from './api';

interface AuthProps {
  onLogin: (token: string) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin
        ? { email, password }
        : { username, email, password };

      const response = await fetch(apiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          onLogin(data.accessToken);
        } else {
          setMessage('Registration successful! You can now log in.');
          setIsLogin(true);
        }
      } else {
        setMessage(data.message || 'An error occurred');
      }
    } catch (error) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyRegister = async () => {
    if (!email) {
      setMessage('Please enter your email first');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Get registration options
      const optionsResponse = await fetch(apiUrl('/api/auth/passkey/register/options'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!optionsResponse.ok) {
        const error = await optionsResponse.json();
        setMessage(error.message || 'Failed to get registration options');
        return;
      }

      const options = await optionsResponse.json();

      // Start WebAuthn registration
      const registrationResponse = await startRegistration(options);

      // Verify registration
      const verifyResponse = await fetch(apiUrl('/api/auth/passkey/register/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, response: registrationResponse })
      });

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok) {
        setMessage('Passkey registered successfully! You can now log in with it.');
      } else {
        setMessage(verifyData.message || 'Passkey registration failed');
      }
    } catch (error) {
      console.error('Passkey registration error:', error);
      setMessage('Passkey registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Get authentication options
      const optionsResponse = await fetch(apiUrl('/api/auth/passkey/authenticate/options'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(email ? { email } : {})
      });

      if (!optionsResponse.ok) {
        const error = await optionsResponse.json();
        setMessage(error.message || 'Failed to get authentication options');
        return;
      }

      const options = await optionsResponse.json();

      // Start WebAuthn authentication
      const authResponse = await startAuthentication(options);

      // Verify authentication
      const verifyResponse = await fetch(apiUrl('/api/auth/passkey/authenticate/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(email ? { email, response: authResponse } : { response: authResponse })
      });

      const verifyData = await verifyResponse.json();

      if (verifyResponse.ok) {
        onLogin(verifyData.accessToken);
      } else {
        setMessage(verifyData.message || 'Passkey authentication failed');
      }
    } catch (error) {
      console.error('Passkey authentication error:', error);
      setMessage('Passkey authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>

        <form onSubmit={handlePasswordAuth}>
          {!isLogin && (
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div className="divider">or</div>

        <div className="passkey-section">
          <button
            onClick={isLogin ? handlePasskeyLogin : handlePasskeyRegister}
            disabled={loading || (!isLogin && !email)}
            className="passkey-button"
          >
            {loading ? 'Loading...' : (isLogin ? 'Login with Passkey' : 'Register Passkey')}
          </button>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="auth-toggle">
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}