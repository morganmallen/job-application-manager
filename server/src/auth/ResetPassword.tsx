import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './SignIn.css';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing token.');
      navigate('/signin');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reset password');
      }

      toast.success('Password reset successful. You can now log in.');
      navigate('/signin');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app page-root">
      <Header />
      <div className="signin-page">
        <form className="signin-form" onSubmit={handleSubmit}>
          <h2>Reset Password</h2>

          <label htmlFor="password">New Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
