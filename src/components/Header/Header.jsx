import React, { useState } from "react";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { useLocation } from "react-router-dom";
import NavBar from "../NavBar/NavBar";
import NotificationBell from "../NotificationBell/NotificationBell";
import "./Header.css";
import { useAuth } from "../../context/AuthContext";

function BookLogo() {
  return (
    <svg
      className="header-logo__book"
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="book-spine"
        d="M30.5 10.5c-4.3-0.9-9-1.2-14-0.7-2.9 0.3-5.6 0.9-8.1 1.7v40.2c2.5-0.8 5.2-1.4 8.1-1.7 5-0.5 9.7-0.2 14 0.7V10.5z"
      />
      <path
        className="book-cover"
        d="M33.5 10.5c4.3-0.9 9-1.2 14-0.7 2.9 0.3 5.6 0.9 8.1 1.7v40.2c-2.5-0.8-5.2-1.4-8.1-1.7-5-0.5-9.7-0.2-14 0.7V10.5z"
      />
      <path
        className="book-page book-page--left"
        d="M30.5 13.2c-3.9-0.7-8-0.9-12.2-0.5-2.2 0.2-4.4 0.6-6.4 1.2v31.4c2-0.6 4.2-1 6.4-1.2 4.2-0.4 8.3-0.2 12.2 0.5V13.2z"
      />
      <path
        className="book-page book-page--right"
        d="M33.5 13.2c3.9-0.7 8-0.9 12.2-0.5 2.2 0.2 4.4 0.6 6.4 1.2v31c-2-0.6-4.2-0.9-6.4-1.2-4.2-0.4-8.3-0.2-12.2 0.5V13.2z"
      />
      <path
        className="book-glow"
        d="M30.5 9.5c-4.6-1-9-1.2-13-0.8-3.5 0.4-6.7 1.1-9.4 2.1-0.8 0.3-1.6 0.7-2.3 1.1 0.7 0.5 1.5 0.8 2.3 1.1 2.7 1 5.9 1.7 9.4 2.1 4 0.4 8.4 0.2 13-0.8 0.3-0.1 0.6-0.1 0.9-0.2 0.3 0.1 0.6 0.1 0.9 0.2 4.6 1 9 1.2 13 0.8 3.5-0.4 6.7-1.1 9.4-2.1 0.8-0.3 1.6-0.7 2.3-1.1-0.7-0.5-1.5-0.8-2.3-1.1-2.7-1-5.9-1.7-9.4-2.1-4-0.4-8.4-0.2-13 0.8-0.3 0.1-0.6 0.1-0.9 0.2-0.3-0.1-0.6-0.1-0.9-0.2z"
      />
    </svg>
  );
}

function Header({ categories }) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  const handleToggleCategories = () => {
    setCategoriesOpen((prev) => {
      const next = !prev;
      if (next) setNavOpen(false);
      return next;
    });
  };

  const handleToggleNav = (open) => {
    setNavOpen(open);
    if (open) setCategoriesOpen(false);
  };

  return (
    <header className="site-header">
      <div className="header-brand">
        <div className="header-logo">
          <BookLogo />
        </div>
        <div className="header-text">
          <span className="brand-highlight">Noticias</span>
          <span>Corporativas</span>
        </div>
      </div>
      <div className="header-actions">
        {categories && (
          <div className="header-categories-wrapper">
            <button
              type="button"
              className={
                categoriesOpen
                  ? "header-categories-toggle header-categories-toggle--open"
                  : "header-categories-toggle"
              }
              onClick={handleToggleCategories}
            >
              Categorías <ExpandMoreRoundedIcon />
            </button>
            {categoriesOpen && <div className="header-categories">{categories}</div>}
          </div>
        )}

        {user && !isDashboardRoute && <NotificationBell />}

        <NavBar forcedClosed={categoriesOpen} onToggle={handleToggleNav} />
      </div>
    </header>
  );
}

export default Header;

