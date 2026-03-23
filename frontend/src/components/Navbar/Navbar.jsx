import "./Navbar.css";
import { Link } from "react-router-dom";
import SearchForm from "@/components/SearchForm/SearchForm";
import AddMovieButton from "@/components/AddMovieButton/AddMovieButton";

function Navbar() {
  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <Link to="/">The Movie Project</Link>
      </div>
      <SearchForm />
      <AddMovieButton />
    </nav>
  );
}

export default Navbar;
