import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "./muncho_core/firebaseConfig";
import { BrowserRouter, Route, Routes } from "react-router-dom";

// For SSR/SSG compatibility (not typically needed in client-only apps)
if (typeof window === "undefined") {
  React.useLayoutEffect = React.useEffect;
}

const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="*" element={<App />} />
    </Routes>
  </BrowserRouter>
);
