import React, { useState } from "react";
import "./SignIn.css";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Loading } from "../components/loading";
import Swal from "sweetalert2";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      // 1. Leer el body stream UNA SOLA VEZ
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          Swal.fire({
            title: "Login Failed",
            text: "Invalid email or password.",
            icon: "error",
          });
        } else {
          throw new Error(data.message || "Failed to login, try again");
        }
      } else {
        //if response is ok 
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("refresh_token", data.refresh_token);
        if (data.user) {
          const { first_name, last_name, email, id } = data.user;
          localStorage.setItem(
            "user",
            JSON.stringify({ first_name, last_name, email, userID: id })
          );
        }
        navigate("/dashboard");
      }
    } catch (err: any) {
      // Este catch capturará el error si el `fetch` falla o si lanzas un `throw new Error`
      setError(err.message || "An unexpected error occurred.");
    } finally {
      // Esto siempre se ejecutará al final, con éxito o con error
      setLoading(false);
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
            disabled={loading}
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? <Loading size="small" message="" /> : "Sign In"}
          </button>
          <div className="register-link">
            Don't have an account? <Link to="/signup">Register</Link>
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