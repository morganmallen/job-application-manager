import { useState, useEffect, useRef } from "react";
import logo from "../assets/NextStep-logo.svg";
import "./Header.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import { NotificationDropdown } from "./notifications";

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = async () => {
    const { logout } = await import("../utils/auth");
    try {
      await logout();
      setUser(null);
      setIsDropdownOpen(false);
      navigate("/signin");
      toast.success("Session closed successfully");
    } catch (error) {
      console.error("Failed to logout:", error);
      // Still clear local data and redirect
      setUser(null);
      setIsDropdownOpen(false);
      navigate("/signin");
      toast.warning("Logged out (with errors)");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteAccount = async () => {
    const result = await Swal.fire({
      title: "Delete account?",
      text: "This action cannot be undone. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const userId = user?.userID;
      if (!userId) {
        toast.error("No user session found");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete account");
      }

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
      setIsDropdownOpen(false);
      navigate("/");
      toast.success("Account deleted successfully");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
    }
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
          {!user ? null : ( // Non-logged users only see auth buttons - no navigation needed
            // Logged users see Dashboard, Board, Analytics
            <>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/board"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Board
              </NavLink>
              <NavLink
                to="/analytics"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Analytics
              </NavLink>
            </>
          )}

          {/* Show Sign In/Sign Up buttons directly in nav for non-logged users */}
          {!user && (
            <>
              <NavLink
                to="/signin"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </NavLink>
            </>
          )}

          <div className="mobile-user-menu">
            {!user ? (
              <>
                <NavLink
                  to="/signin"
                  className={({ isActive }) =>
                    `nav-link${isActive ? " active" : ""}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    `nav-link${isActive ? " active" : ""}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `nav-link${isActive ? " active" : ""}`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </NavLink>
                <button
                  className="nav-link"
                  onClick={() => {
                    handleDeleteAccount();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Delete Account
                </button>
                <button
                  className="nav-link"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>

        {/* Notification dropdown and user dropdown for logged-in users */}
        {user && (
          <div className="header-actions desktop-only">
            <NotificationDropdown userId={user.userID || user.id} />

            <div className="user-dropdown-wrapper" ref={dropdownRef}>
              <button
                className="nav-link user-icon"
                onClick={toggleDropdown}
                aria-label="Toggle user menu"
              >
                👤
              </button>

              {isDropdownOpen && (
                <div className="user-dropdown">
                  <Link
                    to="/profile"
                    className="dropdown-item"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    className="dropdown-item delete"
                    onClick={() => {
                      handleDeleteAccount();
                      setIsDropdownOpen(false);
                    }}
                  >
                    Delete Account
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
