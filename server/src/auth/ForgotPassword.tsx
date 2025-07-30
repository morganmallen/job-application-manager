// src/pages/ForgotPassword.tsx
import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import './ForgotPassword.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const templateParams = {
      to_email: email,
      reset_link: `${window.location.origin}/reset-password?email=${encodeURIComponent(email)}`,
    };

    try {
      await emailjs.send(
        'service_u5d9f3t',
        'template_hia7dee',
        templateParams,
        's_QfeXZJLKKiwrNGY'
      );

      toast.success('Check your email for the reset link');
      setEmail('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reset link');
    }
  };

  return (
    <div className="app page-root">
      <Header />
      <div className="forgot-password-page">
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <h2>Forgot Password</h2>
          <label htmlFor="email">Enter your email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <button type="submit">Send Reset Link</button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
