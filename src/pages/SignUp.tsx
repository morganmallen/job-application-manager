import React, { useState } from 'react';
import './SignUp.css';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SignUp = () => {
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!first_name || !last_name || !email || !password) {
      setError('Please fill out all fields.');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Registration failed');
      }

      navigate('/signin');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="app page-root">
      <Header />
      <div className="signup-page">
        <form className="signup-form" onSubmit={handleSubmit}>
          <h2>Create Account</h2>
          {error && <div className="error-message">{error}</div>}

          <label htmlFor="first_name">First Name</label>
          <input
            id="first_name"
            type="text"
            value={first_name}
            onChange={e => setFirstName(e.target.value)}
            required
          />

          <label htmlFor="last_name">Last Name</label>
          <input
            id="last_name"
            type="text"
            value={last_name}
            onChange={e => setLastName(e.target.value)}
            required
          />

          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          <button type="submit">Register</button>

          <div className="login-link">
            Already have an account? <Link to="/signin">Sign In</Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default SignUp;
