import "./Navbar.css";

function Navbar() {
  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <a id="home-button" href="#">
          The Movie Project
        </a>
      </div>
      <form className="search-form">
        <button className="search-button" type="button">
          Buscar
        </button>
        <input placeholder="Una peli..." type="text" />
      </form>
    </nav>
  );
}

export default Navbar;
