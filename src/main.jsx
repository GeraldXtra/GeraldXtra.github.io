import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// The global layers load before App so that component stylesheets, which are
// pulled in through App's own imports, land after them in the bundle and win
// on equal specificity. Swapping these two lines silently breaks the cascade.
import "./styles/index.css";
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
