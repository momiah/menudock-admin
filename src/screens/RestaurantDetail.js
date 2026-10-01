import React from "react";
import { useRestaurant } from "../lib/useData";
import StatusPill from "../components/StatusPill";
import AreaChart from "../components/charts/AreaChart";
import BarChart from "../components/charts/BarChart";
import { gbp, gbp2, num } from "../lib/format";
import { websiteUrl, loyaltyUrl, dashboardUrl } from "../lib/links";
import { ChevronLeft, Globe, Gift, Gauge } from "../components/Icons";

function Mini({ label, value, delta, cls = "" }) {
  return (
    <div className="mini">
      <div className="m-l">{label}</div>
      <div className="m-v tnum">{value}</div>
      {delta != null && <div className={`m-d ${cls}`}>{delta}</div>}
    </div>
  );
}

function LinkBtn({ icon, label, sub, href }) {
  return (
    <a className="linkbtn" href={href} target="_blank" rel="noreferrer">
      <span className="ic">{icon}</span>
      <span>{label}<small>{sub}</small></span>
    </a>
  );
}

export default function RestaurantDetail({ id, onBack }) {
  const { restaurant: r, menu, loading, error } = useRestaurant(id);

  if (loading) return <div className="placeholder"><div className="spinner" /><div>Loading…</div></div>;
  if (error || !r) return (
    <div>
      <button className="back" onClick={onBack}><ChevronLeft width="16" height="16" />All restaurants</button>
      <div className="placeholder">{error || "Not found"}</div>
    </div>
  );

  const colors = r.theme?.colors || {};
  const ordering = r.ordering || {};
  const perf = r.perf, earn = r.earn;

  return (
    <div>
      <button className="back" onClick={onBack}><ChevronLeft width="16" height="16" />All restaurants</button>

      <div className="dhead">
        <div className="ravatar" style={{ background: colors.primary || "#0E7C7B" }}>
          {r.theme?.logoUrl ? <img src={r.theme.logoUrl} alt="" /> : (r.name || "?")[0]}
        </div>
        <div className="h-main">
          <h2>{r.name} <StatusPill status={r.status} /></h2>
          <div className="h-meta">
            <span className="mono">{r.slug}</span>
            {r.cuisine && <span>· {r.cuisine}</span>}
            {r.address?.city && <span>· {r.address.city}</span>}
          </div>
        </div>
        <div className="links">
          <LinkBtn icon={<Globe />} label="Website" sub={(r.domains && r.domains[0]) || `${r.slug}.app`} href={websiteUrl(r)} />
          <LinkBtn icon={<Gift />} label="Loyalty app" sub="member rewards" href={loyaltyUrl(r)} />
          <LinkBtn icon={<Gauge />} label="Owner dashboard" sub="orders & settings" href={dashboardUrl(r)} />
        </div>
      </div>

      <div className="ministats">
        <Mini label="Client GMV" value={gbp(perf.gmv)} delta={`${num(perf.count)} orders`} />
        <Mini label="Avg order" value={gbp2(perf.aov)} delta="per basket" />
        <Mini label="Months active" value={earn.months} delta={`since ${r.createdAt ? "onboarding" : "—"}`} />
        <Mini label="Your earnings" value={gbp(earn.total)} delta="setup + retainer + fee" cls="up" />
      </div>

      <div className="grid2">
        <div className="card">
          <h3>Revenue</h3>
          <div className="card-sub">Weekly client GMV · last 12 weeks · <span style={{ color: "var(--series-1)", fontWeight: 600 }}>{gbp(perf.gmv)}</span> total</div>
          {perf.hasTimeline
            ? <AreaChart values={perf.revenue} labels={perf.labels} format={gbp} />
            : <div className="placeholder" style={{ minHeight: 160 }}>No dated orders yet to chart.</div>}
          <div className="legend"><span><span className="mk" style={{ background: "var(--series-1)" }} />Weekly GMV</span></div>
        </div>

        <div className="card">
          <h3>Your earnings</h3>
          <div className="card-sub">MenuDock money model</div>
          <div className="card-row"><span className="lbl">Setup fee (one-off)</span><span className="val tnum">{gbp(earn.setup)}</span></div>
          <div className="card-row"><span className="lbl">Retainer × {earn.months} mo</span><span className="val tnum">{gbp(earn.retainer)}</span></div>
          <div className="card-row"><span className="lbl">Platform fee ({earn.config.platformFeePercent}% of GMV)</span><span className="val tnum">{gbp(earn.fee)}</span></div>
          <div className="card-row"><span className="lbl">Total to date</span><span className="val tnum">{gbp(earn.total)}</span></div>
        </div>
      </div>

      <div className="grid2" style={{ marginTop: 16 }}>
        <div className="card">
          <h3>Orders by week</h3>
          <div className="card-sub">Volume trend</div>
          {perf.hasTimeline
            ? <BarChart values={perf.ordersByWeek} labels={perf.labels} unit="orders" />
            : <div className="placeholder" style={{ minHeight: 160 }}>No dated orders yet.</div>}
        </div>

        <div className="card">
          <h3>Payments & config</h3>
          <div className="card-sub">Drives the website &amp; dashboard</div>
          <div className="card-row"><span className="lbl">Stripe</span><span className="val">{r.payments?.stripeAccountId
            ? <StatusPill status="active" /> : <StatusPill status="pending" />}</span></div>
          <div className="card-row"><span className="lbl">Account</span><span className="val mono">{r.payments?.stripeAccountId || "—"}</span></div>
          <div className="card-row"><span className="lbl">Order types</span><span className="val">{(ordering.orderTypes || []).join(", ") || "—"}</span></div>
          <div className="card-row"><span className="lbl">Delivery radius</span><span className="val">{ordering.deliveryRadiusMiles != null ? `${ordering.deliveryRadiusMiles} mi` : "—"}</span></div>
          <div className="card-row"><span className="lbl">Postcodes</span><span className="val">{(ordering.allowedPostcodePrefixes || []).join(", ") || "—"}</span></div>
          <div className="card-row"><span className="lbl">Delivery fee</span><span className="val">{ordering.deliveryFee != null ? gbp2(ordering.deliveryFee) : "—"}</span></div>
          <div className="card-row"><span className="lbl">Theme</span><span className="val"><span className="swatches">
            {["primary", "secondary", "accent"].map((k) => colors[k] ? <span key={k} className="sw"><span className="chip" style={{ background: colors[k] }} /></span> : null)}
          </span></span></div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Menu <span style={{ color: "var(--faint)", fontWeight: 500, fontSize: ".85rem" }}>· {menu.reduce((a, c) => a + (c.items?.length || 0), 0)} items</span></h3>
        <div className="card-sub">Lives in <span className="mono">restaurants/{r.id}/menu</span></div>
        {menu.length === 0 ? (
          <div className="placeholder" style={{ minHeight: 120 }}>No menu yet.</div>
        ) : (
          menu.map((cat) => (
            <div key={cat.id} style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: ".85rem", margin: "8px 0" }}>{cat.category}</div>
              <div className="menuprev">
                {(cat.items || []).map((m, i) => (
                  <div className="mi" key={i}>
                    <div className="ph">{m.imageUrl ? <img src={m.imageUrl} alt="" /> : <span style={{ fontSize: ".7rem" }}>no image</span>}</div>
                    <div className="mi-b"><div className="mi-n">{m.name}</div><div className="mi-p tnum">{gbp2(m.price)}</div></div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
