import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-toastify';
import './ForgotReset.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Paso 1: pedir token al backend
      const response = await fetch('https://jobapp-api-aryf.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('No se pudo obtener el token de restablecimiento');
      }

      const data = await response.json();
      const resetToken = data.token;

      // ✅ Paso 2: construir el link de reseteo
      const resetLink = `http://localhost:5173/reset-password?token=${encodeURIComponent(resetToken)}`;

      // ✅ Paso 3: enviar el email con EmailJS
      const templateParams = {
        to_email: email,
        reset_link: resetLink,
      };

      await emailjs.send(
        'service_u5d9f3t',         // ✔️ tu ID de servicio
        'template_hia7dee',        // ✔️ tu plantilla
        templateParams,
        's_QfeXZJLKKiwrNGY'        // ✔️ tu clave pública
      );

      toast.success('Check your email for the reset link');
      setEmail('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to send reset link');
    } finally {
      setLoading(false);
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
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
