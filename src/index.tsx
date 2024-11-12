import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter as Router } from "react-router-dom";
import App from "./app/App";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
      <Router>
        <App />
      </Router>
  );
}
