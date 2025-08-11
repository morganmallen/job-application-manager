import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./ForgotReset.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Loading } from "../components/loading";

const ResetPassword = () => {
  const query = new URLSearchParams(useLocation().search);
  const token = query.get("token") || "";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd: string) => {
    const hasMinLength = pwd.length >= 6;
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    return hasMinLength && hasUpperCase && hasNumber;
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please complete all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!validatePassword(password)) {
      toast.error(
        "Password must be at least 6 characters, include one uppercase letter, and one number."
      );
      return;
    }

    if (!token) {
      toast.error("Missing or invalid reset token");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword: password }),
        }
      );

      if (!response.ok) {
        throw new Error("Reset failed");
      }

      toast.success("Password reset successful");
      navigate("/signin");
    } catch (err) {
      console.error(err);
      toast.error("Error resetting password");
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
          <label htmlFor="password">Password</label>
          <div className="password-wrapper">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-wrapper">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? <Loading /> : "Reset Password"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ResetPassword;
