import { lazy, Suspense } from "react";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";

const Home = lazy(() => import("./pages/Home/Home.jsx"));
const MovieDetailWrapper = lazy(
  () => import("./pages/MovieDetail/MovieDetailWrapper.jsx"),
);

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <Home />
              </ErrorBoundary>
            }
          />
          <Route
            path="/movies/:id"
            element={
              <ErrorBoundary>
                <MovieDetailWrapper />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
