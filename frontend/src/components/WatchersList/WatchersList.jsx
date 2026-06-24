import "./WatchersList.css";

function WatchersList({ watchers }) {
  return (
    <ul className="watchers-list">
      <header>
        {watchers.length > 0 ? "Vista por:" : "Nadie la ha visto"}
      </header>
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
