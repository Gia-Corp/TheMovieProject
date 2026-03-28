import "./Navbar.css";
import { Link } from "react-router-dom";
import SearchBar from "@/components/SearchBar/SearchBar";
import AddMovieButton from "@/components/AddMovieButton/AddMovieButton";

function Navbar() {
  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <Link to="/">The Movie Project</Link>
      </div>
      <SearchBar />
      <AddMovieButton />
    </nav>
  );
}

export default Navbar;
