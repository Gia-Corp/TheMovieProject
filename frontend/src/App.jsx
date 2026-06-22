import { lazy, Suspense } from "react";
import { Routes, Route, BrowserRouter, useLocation } from "react-router-dom";
import Navbar from "@/components/navigation/Navbar/Navbar";
import { ErrorBoundary } from "@/error_handling/ErrorBoundary";
import SpinnerIcon from "@/components/SpinnerIcon/SpinnerIcon";

const Home = lazy(() => import("@/pages/Home/Home"));
const MovieDetailWrapper = lazy(
  () => import("@/pages/MovieDetail/MovieDetailWrapper"),
);
const Profile = lazy(() => import("@/pages/Profile/Profile"));

function AppContent() {
  const location = useLocation();

  return (
    <>
      <Navbar />
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
