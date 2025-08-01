import { useState, useEffect, useRef } from "react";
import logo from "../assets/NextStep-logo.svg";
import "./Header.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Función toggleDropdown que faltaba
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) {
        await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error("Failed to revoke refresh token", error);
    }

    localStorage.removeItem("jwtToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    setIsDropdownOpen(false);
    navigate("/signin");
    toast.success("Session closed successfully");
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-section">
          <Link to="/">
            <img src={logo} alt="full-logo" />
          </Link>
        </div>

        <nav className={`nav-menu ${isMobileMenuOpen ? "active" : ""}`}>
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            end
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/board"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Board
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Analytics
          </NavLink>
          
          <div className="mobile-user-menu">
            {!user ? (
              <>
                <NavLink
                  to="/signin"
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </NavLink>
                <NavLink
                  to="/delete-account"
                  className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Delete Account
                </NavLink>
                <button 
                  className="nav-link"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  style={{background: 'none', border: 'none', width: '100%', textAlign: 'center'}}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>

        <div className="user-dropdown-wrapper desktop-only" ref={dropdownRef}>
          <button 
            className="nav-link user-icon" 
            onClick={toggleDropdown} // Aquí usamos la función que ahora está definida
            aria-label="Toggle user menu"
          >
            👤
          </button>

          {isDropdownOpen && (
            <div className="user-dropdown">
              {!user ? (
                <>
                  <Link to="/signin" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Sign In</Link>
                  <Link to="/signup" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Sign Up</Link>
                </>
              ) : (
                <>
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>Profile</Link>
                  <Link to="/delete-account" className="dropdown-item delete" onClick={() => setIsDropdownOpen(false)}>Delete Account</Link>
                  <button style={{fontSize: '0.9rem', fontWeight: 600}} className="dropdown-item" onClick={handleLogout}>Logout</button>
                </>
              )}
            </div>
          )}
        </div>

        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>
    </header>
  );
};

export default Header;