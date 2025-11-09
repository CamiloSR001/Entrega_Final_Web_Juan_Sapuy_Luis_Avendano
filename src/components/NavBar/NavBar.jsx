import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PersonAddAltRoundedIcon from "@mui/icons-material/PersonAddAltRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import "./NavBar.css";
import { useAuth } from "../../context/AuthContext";

function NavBar({ forcedClosed = false, onToggle }) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (forcedClosed && mobileOpen) {
      setMobileOpen(false);
    }
  }, [forcedClosed, mobileOpen]);

  const baseLinks = [{ label: "Inicio", to: "/", icon: <HomeRoundedIcon /> }];

  if (user?.role === "reportero") {
    baseLinks.push({ label: "Mis noticias", to: "/dashboard/noticias", icon: <NewspaperRoundedIcon /> });
  }

  if (user?.role === "editor") {
    baseLinks.push({ label: "Gestión", to: "/dashboard/editor", icon: <ManageAccountsRoundedIcon /> });
  }

  const authLinks = user
    ? [
        { label: "Dashboard", to: "/dashboard", icon: <DashboardRoundedIcon /> },
        { label: "Cerrar sesión", action: logout, icon: <LogoutRoundedIcon /> },
      ]
    : [
        { label: "Login", to: "/auth/login", icon: <LoginRoundedIcon /> },
        { label: "Registro", to: "/auth/register", icon: <PersonAddAltRoundedIcon /> },
      ];

  const links = [...baseLinks, ...authLinks];

  const closeMobile = () => setMobileOpen(false);

  const handleToggle = () => {
    setMobileOpen((prev) => {
      const next = !prev;
      onToggle?.(next);
      return next;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
        onToggle?.(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [onToggle]);

  return (
    <nav className="navbar">
      <button className="navbar__toggle" type="button" onClick={handleToggle}>
        <span />
        <span />
        <span />
      </button>

      <ul className="navbar__list">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <NavLink
                to={link.to}
                className={({ isActive }) => (isActive ? "navbar__link navbar__link--active" : "navbar__link")}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ) : (
              <button type="button" className="navbar__button" onClick={link.action}>
                {link.icon}
                <span>{link.label}</span>
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className={mobileOpen ? "navbar__drawer navbar__drawer--open" : "navbar__drawer"}>
        {links.map((link) => (
          <div key={`drawer-${link.label}`} className="navbar__drawer-item">
            {link.to ? (
              <NavLink to={link.to} onClick={closeMobile}>
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            ) : (
              <button
                type="button"
                onClick={() => {
                  link.action?.();
                  closeMobile();
                }}
              >
                {link.icon}
                <span>{link.label}</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {mobileOpen && <div className="navbar__overlay" onClick={closeMobile} />}
    </nav>
  );
}

export default NavBar;

