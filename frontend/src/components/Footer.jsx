import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";
import { TOOLS } from "../tools.js";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Logo />
          <p className="muted" style={{ marginTop: 12, maxWidth: 280 }}>Everything you need. All in one place. Free forever, no sign-up.</p>
        </div>
        <div>
          <h4>Tools</h4>
          {TOOLS.map((t) => <Link key={t.id} to={t.path}>{t.name}</Link>)}
        </div>
        <div>
          <h4>Company</h4>
          <Link to="/about">About THUL</Link>
          <Link to="/about#contact">Contact</Link>
          <Link to="/feedback">Feedback</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
        </div>
      </div>
      <div className="container footer-bottom muted">© {new Date().getFullYear()} THUL. All rights reserved.</div>
    </footer>
  );
}
