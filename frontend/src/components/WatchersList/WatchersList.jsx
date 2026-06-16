import "./WatchersList.css";

function WatchersList({ watchers, yourId }) {
  return (
    <ul className="watchers-list">
      {watchers.length > 0 ? <p>Vista por:</p> : <p>Nadie la ha visto</p>}
      {watchers.map((w) => {
        return (
          <li key={w.user.id} className="watchers-list-item">
            <img src={w.user.profile_pic} alt="" />
            <p>{w.user.nickname}</p>
          </li>
        );
      })}
    </ul>
  );
}

export default WatchersList;
