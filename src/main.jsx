import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// The whole design lives in one global stylesheet, imported once here.
import "./styles/site.css";
import App from "./App";

const container = document.getElementById("root");

if (!container) {
  throw new Error("The root element is missing from index.html");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
