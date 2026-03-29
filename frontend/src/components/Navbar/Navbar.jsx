import "./Navbar.css";
import { Link } from "react-router-dom";
import SearchBar from "@/components/SearchBar/SearchBar";
import AddMovieButton from "@/components/AddMovieButton/AddMovieButton";
import { useRepos } from "@/hooks/useRepos";
import MovieWatchedIcon from "@/components/MovieWatchedIcon/MovieWatchedIcon";

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

  function renderMovieResult(movie) {
    return (
      <>
        <p>{`${movie.title} (${movie.year})`}</p>
        {movie.watched ? <MovieWatchedIcon size={20} /> : null}
      </>
    );
  }

  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <Link to="/">The Movie Project</Link>
      </div>
      <SearchBar
        placeholder="¿Qué peli buscás?"
        searchCall={searchCall}
        renderItem={renderMovieResult}
      />
      <AddMovieButton />
    </nav>
  );
}

export default Navbar;
