import "./NotificationPopup.css";

function NotificationPopup({ title, movie, handleClick }) {
  return (
    <dialog open className="notification">
      <h4>{title}</h4>
      {handleClick ? (
        <button onClick={handleClick}>
          <img src={movie.poster_url} alt="" />
          {movie.title}
        </button>
      ) : null}
    </dialog>
  );
}

export default NotificationPopup;
