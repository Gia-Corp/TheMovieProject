import "./Navbar.css";
import SearchForm from "../SearchForm/SearchForm";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <Link to="/">The Movie Project</Link>
      </div>
      <SearchForm />
    </nav>
  );
}

export default Navbar;
