import { Routes, Route, BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Home from "./pages/Home/Home.jsx";
import MovieDetailWrapper from "./pages/MovieDetail/MovieDetailWrapper";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies/:id" element={<MovieDetailWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
