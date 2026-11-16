import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import Logo from "./Logo.jsx";
import useTheme from "../hooks/useTheme.js";

const LINKS = [["/", "Home"], ["/tools", "All Tools"], ["/about", "About"], ["/feedback", "Feedback"]];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [theme, toggle] = useTheme();
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="nav glass">
      <div className="container nav-inner">
        <Link to="/" aria-label="THUL home"><Logo /></Link>
        <nav className={`nav-links ${open ? "open" : ""}`}>
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}>{label}</NavLink>
          ))}
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-btn menu-btn" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
