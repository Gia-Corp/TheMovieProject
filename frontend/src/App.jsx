import MovieDetail from "./components/MovieDetail";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import "./bootstrap.min.css";
import MovieServiceProvider from "./components/MovieServiceProvider";
import MovieApiServiceProvider from "./components/MovieApiServiceProvider";

function App() {
  return (
    <MovieServiceProvider>
      <MovieApiServiceProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/movie" element={<MovieDetail />} />
          </Routes>
        </BrowserRouter>
      </MovieApiServiceProvider>
    </MovieServiceProvider>
  );
}

export default App;
