import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { getCurrentWindow } from '@tauri-apps/api/window';

// when using `"withGlobalTauri": true`, you may use
// const { getCurrentWindow } = window.__TAURI__.window;

const appWindow = getCurrentWindow();


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
