import { lazy, Suspense } from "react";
import { Routes, Route, BrowserRouter, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import { ErrorBoundary } from "./components/ErrorBoundary/ErrorBoundary";

const Home = lazy(() => import("./pages/Home/Home.jsx"));
const MovieDetailWrapper = lazy(
  () => import("./pages/MovieDetail/MovieDetailWrapper.jsx"),
);

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <Suspense fallback={<div>Cargando...</div>}>
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary key={location.pathname}>
                <Home />
              </ErrorBoundary>
            }
          />
          <Route
            path="/movies/:id"
            element={
              <ErrorBoundary key={location.pathname}>
                <MovieDetailWrapper />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
