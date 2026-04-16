import "./Navbar.css";
import { Link } from "react-router-dom";
import SearchBar from "@/components/SearchBar/SearchBar";
import AddMovieButton from "@/components/AddMovieButton/AddMovieButton";
import { useRepos } from "@/hooks/useRepos";
import MovieWatchedIcon from "@/components/MovieWatchedIcon/MovieWatchedIcon";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginButton from "@/components/LoginButton/LoginButton";
import LogoutButton from "@/components/LogoutButton/LogoutButton";

function Navbar() {
  const { movieRepo } = useRepos();
  const { accessToken } = useAuth();

  function searchCall(inputTextToSearch) {
    return movieRepo
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

  const navigate = useNavigate();

  const handleClick = (movie) => {
    navigate(`/movies/${movie.id}`, {
      state: { movie },
      id: movie.id,
    });
  };

  return (
    <nav className="nav-bar">
      <div className="nav-buttons">
        <Link to="/">The Movie Project</Link>
      </div>
      <SearchBar
        placeholder="¿Qué peli buscás?"
        searchCall={searchCall}
        renderItem={renderMovieResult}
        onItemClick={handleClick}
      />
      <div className="nav-buttons">
        <AddMovieButton disabled={!accessToken} />
        {!accessToken ? <LoginButton /> : <LogoutButton />}
      </div>
    </nav>
  );
}

export default Navbar;
