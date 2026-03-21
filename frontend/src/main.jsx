import "@/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { RepositoriesProvider } from "@/providers/RepositoriesProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RepositoriesProvider>
      <App />
    </RepositoriesProvider>
  </StrictMode>,
);
