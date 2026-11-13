import "./Profile.css";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRepos } from "@/hooks/useRepos";
import { isAbortError } from "@/apiFetch";
import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";

function Profile() {
  const { userRepo } = useRepos();
  const { accessToken, currentUser } = useAuth();
  const [user, setUser] = useState(currentUser);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(!user?.email);

  useEffect(() => {
    if (user?.email) return;

    const controller = new AbortController();

    userRepo
      .getUser(user.id, accessToken, controller.signal)
      .then((res) => {
        setUser(res);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!isAbortError(error)) setError(error);
      });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) throw error;

  if (isLoading) {
    return (
      <div className="spinner-container">
        <SpinnerIcon />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <img className="profile-pic" src={user.profile_pic} alt="" />
      <h2>
        <span>{user.nickname}</span>
      </h2>
      <p>📫 {user.email}</p>
      <p>
        Rol:{" "}
        <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
      </p>
    </div>
  );
}

export default Profile;
