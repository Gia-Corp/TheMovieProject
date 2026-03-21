import "./Navbar.css";
import { Link } from "react-router-dom";
import SearchForm from "@/components/SearchForm/SearchForm";

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
