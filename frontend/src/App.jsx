import { lazy, Suspense } from "react";
import { Routes, Route, BrowserRouter, useLocation } from "react-router-dom";
import "./App.css";
import SidebarPanel from "@/components/navigation/SidebarPanel/SidebarPanel";
import { ErrorBoundary } from "@/error_handling/ErrorBoundary";
import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";

const Home = lazy(() => import("@/pages/Home/Home"));
const MovieDetailWrapper = lazy(
  () => import("@/pages/MovieDetail/MovieDetailWrapper"),
);
const Profile = lazy(() => import("@/pages/Profile/Profile"));
const WatchedMovies = lazy(() => import("@/pages/WatchedMovies/WatchedMovies"));

function AppContent() {
  const location = useLocation();

  return (
    <>
      <SidebarPanel />
      <div className="app-content">
        <Suspense
          fallback={
            <div className="spinner-container">
              <SpinnerIcon />
            </div>
          }
        >
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
            <Route
              path="/profile"
              element={
                <ErrorBoundary key={location.pathname}>
                  <Profile />
                </ErrorBoundary>
              }
            />
            <Route
              path="/watched-movies"
              element={
                <ErrorBoundary key={location.pathname}>
                  <WatchedMovies />
                </ErrorBoundary>
              }
            />
          </Routes>
        </Suspense>
      </div>
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
