import "./OptionsButton.css";
import { useState, useRef, useEffect } from "react";
import LogoutButton from "@/components/auth/LogoutButton/LogoutButton";

function OptionsButton({ user }) {
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);

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
          <header>{user.nickname}</header>
          <li>
            <LogoutButton />
          </li>
        </ul>
      )}
    </div>
  );
}

export default OptionsButton;
