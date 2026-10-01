import React, { useState } from "react";
import { useAuth } from "./auth/AuthContext";
import Login from "./screens/Login";
import Restaurants from "./screens/Restaurants";
import RestaurantDetail from "./screens/RestaurantDetail";
import OnboardDrawer from "./screens/OnboardDrawer";
import { Grid, Fork, Card, Cog, Plus, Clock, LogOut } from "./components/Icons";

const TABS = [
  { id: "overview", label: "Overview", icon: <Grid /> },
  { id: "restaurants", label: "Restaurants", icon: <Fork /> },
  { id: "billing", label: "Billing", icon: <Card /> },
  { id: "settings", label: "Settings", icon: <Cog /> },
];

export default function App() {
  const { user, isAdmin, loading, signOutUser } = useAuth();
  const [tab, setTab] = useState("restaurants");
  const [detailId, setDetailId] = useState(null);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return <div className="login"><div className="spinner" /></div>;
  }
  if (!user) return <Login />;
  if (!isAdmin) return <Login notAdmin />;

  const title = detailId ? "Restaurant" : TABS.find((t) => t.id === tab).label;
  const crumb = detailId ? "Restaurants" : "Platform";

  function openTab(id) {
    setTab(id);
    setDetailId(null);
  }

  return (
    <div className="app">
      <aside className="side">
        <div className="logo"><div className="mark">M</div><div className="name">Menu<span>Dock</span></div></div>
        <div className="navlabel">Platform</div>
        {TABS.map((t) => (
          <button key={t.id} className={`nav ${tab === t.id && !detailId ? "active" : ""}`} onClick={() => openTab(t.id)}>
            {t.icon}{t.label}
          </button>
        ))}
        <div className="side-foot">
          <div className="av">{(user.email || "A")[0].toUpperCase()}</div>
          <div className="who">MenuDock<small>{user.email}</small></div>
          <button className="signout" title="Sign out" onClick={signOutUser}><LogOut width="18" height="18" /></button>
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div>
            <div className="crumb">{crumb}</div>
            <h1>{title}</h1>
          </div>
          <div className="spacer" />
          {tab === "restaurants" && (
            <button className="btn primary" onClick={() => setOnboardOpen(true)}>
              <Plus />Onboard restaurant
            </button>
          )}
        </div>

        <div className="content">
          {tab === "restaurants" ? (
            detailId ? (
              <RestaurantDetail id={detailId} onBack={() => setDetailId(null)} />
            ) : (
              <Restaurants key={refreshKey} onOpen={setDetailId} />
            )
          ) : (
            <div className="placeholder">
              <Clock className="big" />
              <div><strong>{TABS.find((t) => t.id === tab).label}</strong> — coming next.</div>
              <div style={{ maxWidth: 360 }}>This build focuses on the Restaurants tab: list, drill-in with live performance, and onboarding.</div>
            </div>
          )}
        </div>
      </div>

      <OnboardDrawer
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        onSaved={(id) => { setOnboardOpen(false); setRefreshKey((k) => k + 1); setDetailId(id); }}
      />
    </div>
  );
}
