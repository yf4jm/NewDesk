import { useState, useEffect, Suspense } from "react";
import React from "react";
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import Desktop from "./pages/home";
import SettingsPage from "./pages/settings";
import ChatBotPage from "./pages/chatBot";
import getApps from "./utils/getApps";
import { appRegistry } from "./appRegistry";
import "./App.css"
// Dynamic loader for external apps
function loadExternalApp(appName, path) {
  return new Promise((resolve, reject) => {
    if (window[appName]) return resolve(window[appName]);
    const script = document.createElement("script");
    script.src = path;
    script.onload = () => {
      if (window[appName]) resolve(window[appName]);
      else reject(`App ${appName} not exposed`);
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function App() {
  const [apps, setApps] = useState({ apps: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApps().then((appsManifest) => {
      setApps(appsManifest || { apps: [] });
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div>Loading apps...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/apps/chatbot" element={<ChatBotPage />} />
        <Route path="/" element={<Desktop />} />
        <Route path="/settings" element={<SettingsPage />} />
        {apps.apps.map((app) => {
          // Static app
          if (app.type === "static" && appRegistry[app.name]) {
            const StaticApp = appRegistry[app.name];
            return (
              <Route
                key={app.name}
                path={`/apps/${app.name}`}
                element={<StaticApp />}
              />
            );
          }
          // Dynamic/external app
          if (app.type === "external" && app.path) {
            return (
              <Route
              key={app.name}
              path={`/apps/${app.name}`}
              element={
                <iframe
                src={app.path}
                className="w-screen h-screen"
                style={{ border: "none" }}
                />
              }
              />
            );
          }
          return null;
        })}
      </Routes>
    </Router>
  );
}

export default App;
