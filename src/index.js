import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Site from "./site/Site";
import { isAdminPath } from "./routes";

// One site: the public MenuDock website at /, the admin console at /admin.
// The console (and Firebase Auth) loads only on /admin.
const AdminRoot = lazy(() => import("./AdminRoot"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isAdminPath(window.location.pathname) ? (
      <Suspense fallback={<div className="login"><div className="spinner" /></div>}>
        <AdminRoot />
      </Suspense>
    ) : (
      <Site />
    )}
  </React.StrictMode>
);
