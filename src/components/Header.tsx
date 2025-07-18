import React, { useState } from 'react';
import logo from '../assets/NextStep-logo.svg';
import './Header.css';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <Link to="/">
            <img src={logo} alt='full-logo' />
          </Link>
        </div>
        <nav className={`nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            end
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink 
            to="/board" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Board
          </NavLink>
          <NavLink 
            to="/analytics" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Analytics
          </NavLink>
          <NavLink 
            to="/signin" 
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Sign In
          </NavLink>
        </nav>
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
};

export default Header; 