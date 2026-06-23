import "./OptionsButton.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LogoutButton from "@/components/auth/LogoutButton/LogoutButton";

function OptionsButton({ user }) {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isFocused) return;

    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !e.target.closest("dialog")
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFocused]);

  return (
    <div ref={containerRef} className="options-container">
      <button
        onClick={() => setIsFocused((prev) => !prev)}
        className="options-button"
      >
        <img src={user.profile_pic} alt="" />
      </button>
      {isFocused && (
        <ul className="options-menu">
          <li>
            <button
              onClick={() => navigate("/profile", { state: { user } })}
              className="dropdown-button button-with-icon profile-button"
            >
              <svg viewBox="0 0 640 640">
                <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
              </svg>
              <p>Mi perfil</p>
            </button>
          </li>
          <li>
            <LogoutButton />
          </li>
        </ul>
      )}
    </div>
  );
}

export default OptionsButton;
