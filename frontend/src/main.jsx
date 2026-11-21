import "@/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { RepositoriesProvider } from "@/providers/RepositoriesProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { SelectionProvider } from "@/providers/SelectionProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SelectionProvider>
        <RepositoriesProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </RepositoriesProvider>
      </SelectionProvider>
    </AuthProvider>
  </StrictMode>,
);
