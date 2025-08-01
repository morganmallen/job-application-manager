import React, { useState } from "react";
import "./SignIn.css";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Redirect after login

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to login");
      }

      const data = await response.json();
      localStorage.setItem("jwtToken", data.access_token); // save JWT token in local storage
      localStorage.setItem("refresh_token", data.refresh_token);
      if (data.user) {
        const { first_name, last_name, email } = data.user;
        localStorage.setItem(
          "user",
          JSON.stringify({ first_name, last_name, email })
        );
      }

      // Redirect to dashboard or protected page
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="app page-root">
      <Header />
      <div className="auth-page">
        <form className="auth-form" onSubmit={handleSubmit}>
          <h2>Sign In</h2>
          {error && <div className="error-message">{error}</div>}
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="submit">Sign In</button>
          <div className="register-link">
            Don't have an account? <Link to="/register">Register</Link>
          </div>
          <div className="register-link">
            Forgot your password?{" "}
            <Link to="/forgot-password">Reset password</Link>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default SignIn;
