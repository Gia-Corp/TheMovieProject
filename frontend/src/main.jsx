import "./index.css";
import "./bootstrap.min.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import MovieServiceProvider from "./components/MovieServiceProvider";
import MovieApiServiceProvider from "./components/MovieApiServiceProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MovieServiceProvider>
      <MovieApiServiceProvider>
        <App />
      </MovieApiServiceProvider>
    </MovieServiceProvider>
  </StrictMode>,
);
