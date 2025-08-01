import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ForgotReset.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ResetPassword = () => {
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token') || '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please complete all fields');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!token) {
      toast.error('Missing or invalid reset token');
      return;
    }

    try {
      setLoading(true);
      // Call API to reset password
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Reset failed');
      }
      toast.success('Password reset successful');
      navigate('/signin');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app page-root">
      <Header />
      <div className="reset-password-page">
        <form onSubmit={handleReset} className="reset-password-form">
          <h2>Reset Your Password</h2>
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
