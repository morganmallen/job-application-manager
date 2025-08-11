import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { toast } from "react-toastify";
import "./ForgotReset.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Loading } from "../components/loading";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Ask for the reset token
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to obtain reset token");
      }

      const data = await response.json();
      const resetToken = data.token;

      // Step 2: Build the reset link
      const resetLink = `https://morganmallen.github.io/job-application-manager/reset-password?token=${encodeURIComponent(
        resetToken
      )}`;

      // Step 3: Send the email with EmailJS
      const templateParams = {
        to_email: email,
        reset_link: resetLink,
      };

      await emailjs.send(
        "service_u5d9f3t", // Service ID
        "template_hia7dee", // Template ID
        templateParams,
        "s_QfeXZJLKKiwrNGY" // Public User ID
      );

      toast.success("Check your email for the reset link");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send reset link");
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
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? <Loading size="small" message="" /> : "Send Reset Link"}
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
