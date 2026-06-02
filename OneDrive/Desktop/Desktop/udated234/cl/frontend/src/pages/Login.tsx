import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        username,
        password,
        totpCode: showMfa ? totpCode : null,
      });

      await login(response.data.token);
      showToast('Authentication successful', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      const errMsg = err.response?.data?.message || err.message || 'Login failed';
      showToast(errMsg, 'error');
      if (errMsg.toLowerCase().includes('mfa') || errMsg.toLowerCase().includes('code')) {
        setShowMfa(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div className="card" style={{ width: '400px', padding: '2.5rem', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0F172A' }}>Web PKI Suite</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
            Enterprise Cryptographic Interface
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {showMfa && (
            <div className="form-group" style={{ animation: 'slide-in 0.2s ease-out' }}>
              <label htmlFor="totpCode">Multi-Factor Authenticator Code (TOTP)</label>
              <input
                type="text"
                id="totpCode"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="000000"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', marginTop: '1rem', height: '40px' }}
            disabled={loading}
          >
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};
