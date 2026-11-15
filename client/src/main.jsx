import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ServerStatusProvider } from "./context/ServerStatusContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ServerStatusProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </ServerStatusProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
