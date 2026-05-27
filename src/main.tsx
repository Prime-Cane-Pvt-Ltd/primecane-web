import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Self-hosted variable fonts (spec §7D — no external CDN, font-display: swap)
import "@fontsource-variable/fraunces";
import "@fontsource-variable/hanken-grotesk";

import "./index.css";
import App from "./App.tsx";

const root = document.getElementById("root");
if (!root) throw new Error("Root element #root not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
