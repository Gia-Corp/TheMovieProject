import "./Navbar.css";
import { Link } from "react-router-dom";
import SearchBar from "@/components/navigation/SearchBar/SearchBar";
import AddMovieButton from "@/components/movie_crud/AddMovieButton/AddMovieButton";
import { useRepos } from "@/hooks/useRepos";
import MovieWatchedIcon from "@/components/MovieWatchedIcon/MovieWatchedIcon";
import MovieSemiWatchedIcon from "@/components/MovieSemiWatchedIcon/MovieSemiWatchedIcon";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LoginButton from "@/components/auth/LoginButton/LoginButton";
import LogoutButton from "@/components/auth/LogoutButton/LogoutButton";

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
    const showIcon = movie.watched_by.watcher_users > 0;
    const isFullyWatched =
      movie.watched_by.watcher_users === movie.watched_by.total_users;

    return (
      <>
        <p>{`${movie.title} (${movie.year})`}</p>
        {showIcon &&
          (isFullyWatched ? (
            <MovieWatchedIcon size={20} />
          ) : (
            <MovieSemiWatchedIcon size={20} />
          ))}
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
