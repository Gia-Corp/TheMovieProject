import "./Profile.css";
// import { useState } from "react";
import { useLocation } from "react-router-dom";

function Profile() {
  const { state } = useLocation();
  // const [error, setError] = useState(null);
  // const [user, setUser] = useState(state?.user ?? null);
  // const [isLoading, setIsLoading] = useState(!user?.email);

  // if (error) throw error;

  // if (isLoading) {
  //   return (
  //     <div className="spinner-container">
  //       <SpinnerIcon />
  //     </div>
  //   );
  // }

  return (
    <div className="profile-page">
      <img className="profile-pic" src={state?.user.profile_pic} alt="" />
      <h2>{state?.user.nickname}</h2>
    </div>
  );
}

export default Profile;
