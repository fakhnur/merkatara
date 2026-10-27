import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
            <rect width="100" height="100" rx="22" fill="#2563eb" />
            <path d="M37 42V32C37 24.82 42.82 19 50 19C57.18 19 63 24.82 63 32V42" stroke="white" strokeWidth="7" strokeLinecap="round" />
            <path d="M22 42H78L73 82C72.5 86 69 89 65 89H35C31 89 27.5 86 27 82L22 42Z" fill="white" />
            <path d="M38 52V76M62 52V76M38 53L50 67L62 53" stroke="#2563eb" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>Merkatara</span>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Products
          </NavLink>
          {!isAdmin && (
            <NavLink to="/cart" className="nav-link cart-badge-container">
              <span>Cart</span>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </NavLink>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isAdmin && <span className="badge-admin">Admin</span>}
              <span style={{ fontSize: '0.875rem', color: 'var(--text-main)', fontWeight: 600 }}>
                {user?.name}
              </span>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};
