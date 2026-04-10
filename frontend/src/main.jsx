import "@/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { RepositoriesProvider } from "@/providers/RepositoriesProvider";
import { AuthProvider } from "@/providers/AuthProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <RepositoriesProvider>
        <App />
      </RepositoriesProvider>
    </AuthProvider>
  </StrictMode>,
);
