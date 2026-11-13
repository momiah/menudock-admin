import React, { useEffect } from "react";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";

// The admin console (served at /admin). Kept out of search results.
export default function AdminRoot() {
  useEffect(() => {
    document.title = "MenuDock Console";
    const robots = document.createElement("meta");
    robots.name = "robots";
    robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    return () => robots.remove();
  }, []);
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
