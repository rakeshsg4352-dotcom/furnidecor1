import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          FurniDecor
        </Link>

        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={'navbar-links ' + (menuOpen ? 'active' : '')}>
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/furniture" onClick={closeMenu}>Furniture</Link>
          <Link to="/rooms" onClick={closeMenu}>Room Ideas</Link>
          <Link to="/about" onClick={closeMenu}>About</Link>
          <Link to="/contact" onClick={closeMenu}>Contact</Link>

          <Link to="/cart" className="navbar-cart" onClick={closeMenu}>
            Cart {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="navbar-user">
              <Link to="/profile" onClick={closeMenu}>Profile</Link>
              <Link to="/orders" onClick={closeMenu}>My Orders</Link>
              {isAdmin && <Link to="/admin" onClick={closeMenu}>Admin Dashboard</Link>}
              <button onClick={handleLogout} className="navbar-logout">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn" onClick={closeMenu}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
