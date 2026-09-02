import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h3>FurniDecor</h3>
          <p>Transform Your Space. Define Your Style.</p>
        </div>

        <div className="footer-links">
          <h4>Explore</h4>
          <Link to="/about">About</Link>
          <Link to="/furniture">Furniture</Link>
          <Link to="/rooms">Room Ideas</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="footer-links">
          <h4>Legal</h4>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms</Link>
        </div>

        <div className="footer-support">
          <h4>Customer Support</h4>
          <p>support@furnidecor.com</p>
          <p>+91 98765 43210</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FurniDecor. All rights reserved.</p>
      </div>
    </footer>
  );
}
