import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { RepositoriesProvider } from "./providers/RepositoriesProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RepositoriesProvider>
      <App />
    </RepositoriesProvider>
  </StrictMode>,
);
