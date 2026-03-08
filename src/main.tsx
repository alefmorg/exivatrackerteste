import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { loadSettings, applyTheme } from "./hooks/useSettings";

// Apply saved theme on load
applyTheme(loadSettings().theme);

createRoot(document.getElementById("root")!).render(<App />);
