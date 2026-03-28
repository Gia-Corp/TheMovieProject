import "./Navbar.css";
import { Link } from "react-router-dom";
import SearchBar from "@/components/SearchBar/SearchBar";
import AddMovieButton from "@/components/AddMovieButton/AddMovieButton";
import { useRepos } from "@/hooks/useRepos";

function Navbar() {
  const { movieRepository } = useRepos();

  function searchCall(inputTextToSearch) {
    return movieRepository
      .getMovies({
        page: 1,
        size: 20,
        title: inputTextToSearch,
      })
      .then((res) => res.movies);
  }

  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <Link to="/">The Movie Project</Link>
      </div>
      <SearchBar placeholder="¿Qué peli buscás?" searchCall={searchCall} />
      <AddMovieButton />
    </nav>
  );
}

export default Navbar;
