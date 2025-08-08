import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import "./styles.css";

const NotFound = () => {
  return (
    <div className="app page-root">
      <Header />
      <main className="not-found-main">
        <div className="not-found-container">
          <div className="not-found-content">
            <div className="not-found-icon">🔍</div>
            <h1 className="not-found-title">Page Not Found</h1>
            <p className="not-found-subtitle">
              Oops! The page you're looking for doesn't exist.
            </p>
            <p className="not-found-description">
              The page might have been moved, deleted, or you entered the wrong
              URL.
            </p>

            <div className="not-found-actions">
              <Link to="/" className="not-found-btn not-found-btn--primary">
                Go to Home
              </Link>
              <Link
                to="/dashboard"
                className="not-found-btn not-found-btn--secondary"
              >
                Dashboard
              </Link>
            </div>

            <div className="not-found-help">
              <h3>Looking for something specific?</h3>
              <div className="not-found-links">
                <Link to="/board" className="not-found-link">
                  📋 Application Board
                </Link>
                <Link to="/analytics" className="not-found-link">
                  📊 Analytics
                </Link>
                <Link to="/profile" className="not-found-link">
                  👤 Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
