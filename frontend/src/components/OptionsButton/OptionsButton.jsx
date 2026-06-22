import "./OptionsButton.css";

function OptionsButton({ user }) {
  return (
    <button className="options-button">
      <img src={user.profile_pic} alt="" />
    </button>
  );
}

export default OptionsButton;
