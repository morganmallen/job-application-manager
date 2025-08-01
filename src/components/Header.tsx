import { useState, useEffect } from "react";
import logo from "../assets/NextStep-logo.svg";
import "./Header.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null); // ajusta el tipo si tienes uno
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

const handleLogout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  try {
    if (refreshToken) {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    }
  } catch (error) {
    console.error('Failed to revoke refresh token', error);
  }

  localStorage.removeItem("jwtToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  setUser(null);
  navigate("/signin");
  toast.success("Session closed successfully");
};


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

          {!user ? (
            <NavLink
              to="/signin"
              className={({ isActive }) =>
                `nav-link${isActive ? " active" : ""}`
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </NavLink>
          ) : (
            <>
              <span className="nav-link">👋 Welcome {user.first_name}</span>
              <NavLink
                to="/signin"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
                onClick={handleLogout}
              >
                Logout
              </NavLink>
            </>
          )}
        </nav>

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
