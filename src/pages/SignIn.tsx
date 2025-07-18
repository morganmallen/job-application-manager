import React, { useState } from 'react';
import './SignIn.css';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder for authentication logic
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    // Add sign-in logic here
  };

  return (
    <div className="app page-root">
      <Header />
      <div className="signin-page">
        <form className="signin-form" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
          {error && <div className="error-message">{error}</div>}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="submit">Sign In</button>
          <div className="register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default SignIn; 