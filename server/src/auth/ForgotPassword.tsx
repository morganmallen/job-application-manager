import React, { useState } from 'react';
import './SignIn.css'; // reutilizamos estilos de formularios
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Something went wrong');
      }

      toast.success('Password reset instructions sent to your email.');
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
          <h2>Forgot Password</h2>

          <label htmlFor="email">Enter your email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
