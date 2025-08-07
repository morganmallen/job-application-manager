
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { Link } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);
  return (
    <div className="app page-root">
      <Header />
      <main className="main-content">
        <div className="hero-section">
          <h1>Welcome to NextStep</h1>
          <p>
            Your comprehensive job application management system. Track
            applications, organize your job search, and analyze your progress
            all in one place.
          </p>
          <div className="landing-auth-link">
            <a href="/signin" className="signin-link">
              Sign In to Your Account
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
