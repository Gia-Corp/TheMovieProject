import "./SidebarPanel.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginButton from "@/components/auth/LoginButton/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton/LogoutButton";
import AddMovieButton from "@/components/movie_crud/AddMovieButton/AddMovieButton";

const COLLAPSED_STORAGE_KEY = "sidebar-collapsed";

function getInitialCollapsed() {
  const stored = localStorage.getItem(COLLAPSED_STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
}

function SidebarPanel() {
  const { accessToken, currentUser } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(getInitialCollapsed);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <aside
      className={`sidebar-panel${isCollapsed ? " is-collapsed" : ""}`}
      aria-label="Menú principal"
    >
      <div className="sidebar-header">
        <Link to="/" className="sidebar-title">
          {isCollapsed ? "TMP" : "The Movie Project"}
        </Link>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Expandir menú" : "Contraer menú"}
          aria-expanded={!isCollapsed}
          title={isCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={isCollapsed ? "M9 6l6 6l-6 6" : "M15 6l-6 6l6 6"} />
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav">
        {accessToken ? (
          <>
            <AddMovieButton />
            <Link
              to="/watched-movies"
              className="button-with-icon sidebar-nav-link"
              title="Pelis vistas"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <p>Pelis vistas</p>
            </Link>
            <div className="sidebar-spacer" />
            <Link to="/profile" className="sidebar-profile" title="Mi perfil">
              <img src={currentUser?.profile_pic} alt="" />
              <span>{currentUser?.nickname ?? "Mi perfil"}</span>
            </Link>
            <LogoutButton />
          </>
        ) : (
          <>
            <div className="sidebar-spacer" />
            <LoginButton />
          </>
        )}
      </nav>
    </aside>
  );
}

export default SidebarPanel;
