import "./Navbar.css";
import SearchForm from "../SearchForm/SearchForm";

function Navbar() {
  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <a id="home-button" href="#">
          The Movie Project
        </a>
      </div>
      <SearchForm />
    </nav>
  );
}

export default Navbar;
