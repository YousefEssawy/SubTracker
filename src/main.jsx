import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../design_system/tokens.css";
import "./styles/globals.scss";
import "./i18n";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
