import React, { useMemo, useState } from "react";
import { useRestaurants } from "../lib/useData";
import StatusPill from "../components/StatusPill";
import { gbp, num } from "../lib/format";
import { Store, Coin, Chart, Bag, Search, Chevron } from "../components/Icons";

function Kpi({ label, value, sub, icon }) {
  return (
    <div className="kpi">
      <div className="k-label"><span className="ic">{icon}</span>{label}</div>
      <div className="k-val tnum">{value}</div>
      <div className="k-sub">{sub}</div>
    </div>
  );
}

function Avatar({ r }) {
  return (
    <div className="ravatar" style={{ background: r.theme?.colors?.primary || r.color || "#0E7C7B" }}>
      {r.theme?.logoUrl ? <img src={r.theme.logoUrl} alt="" /> : (r.name || "?")[0]}
    </div>
  );
}

export default function Restaurants({ onOpen }) {
  const { restaurants, loading, error } = useRestaurants();
  const [q, setQ] = useState("");

  const totals = useMemo(() => {
    const active = restaurants.filter((r) => r.status === "active").length;
    const gmv = restaurants.reduce((a, r) => a + r.perf.gmv, 0);
    const fees = restaurants.reduce((a, r) => a + r.earn.total, 0);
    const orders = restaurants.reduce((a, r) => a + r.perf.count, 0);
    return { active, gmv, fees, orders };
  }, [restaurants]);

  const rows = restaurants.filter((r) =>
    (`${r.name} ${r.slug} ${r.cuisine || ""} ${r.address?.city || ""}`).toLowerCase().includes(q.toLowerCase())
  );

  if (loading) return <div className="placeholder"><div className="spinner" /><div>Loading restaurants…</div></div>;
  if (error) return <div className="placeholder"><div>Couldn't load restaurants: {error}</div></div>;

  return (
    <>
      <div className="kpis">
        <Kpi label="Restaurants" value={restaurants.length} sub={<><b>{totals.active} active</b> · {restaurants.length - totals.active} other</>} icon={<Store />} />
        <Kpi label="Your earnings" value={gbp(totals.fees)} sub="setup + retainer + 5% fees" icon={<Coin />} />
        <Kpi label="Client GMV" value={gbp(totals.gmv)} sub="gross merchandise value" icon={<Chart />} />
        <Kpi label="Orders" value={num(totals.orders)} sub="across all clients" icon={<Bag />} />
      </div>

      <div className="panel">
        <div className="panel-head">
          <h3>Onboarded clients</h3>
          <span className="count">{rows.length} of {restaurants.length}</span>
          <div className="search">
            <Search />
            <input placeholder="Search restaurants…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {restaurants.length === 0 ? (
          <div className="placeholder" style={{ minHeight: 200 }}>
            <div><strong>No restaurants yet.</strong></div>
            <div>Use “Onboard restaurant” to add your first client.</div>
          </div>
        ) : (
          <div className="rlist">
            <div className="rrow rhead">
              <div>Restaurant</div>
              <div className="col-status">Status</div>
              <div>GMV</div>
              <div className="col-orders">Orders</div>
              <div className="col-earn">Your earnings</div>
              <div />
            </div>
            {rows.map((r) => (
              <button key={r.id} className="rrow" onClick={() => onOpen(r.id)}>
                <div className="rname">
                  <Avatar r={r} />
                  <div>
                    <div className="nm">{r.name}</div>
                    <div className="sl mono">{r.slug}</div>
                  </div>
                </div>
                <div className="col-status"><StatusPill status={r.status} /></div>
                <div><div className="col-val tnum">{gbp(r.perf.gmv)}</div><div className="col-sub">GMV</div></div>
                <div className="col-orders"><div className="col-val tnum">{num(r.perf.count)}</div><div className="col-sub">orders</div></div>
                <div className="col-earn"><div className="col-val tnum">{gbp(r.earn.total)}</div><div className="col-sub">{r.earn.config.platformFeePercent}% + retainer</div></div>
                <div className="chev"><Chevron width="18" height="18" /></div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
