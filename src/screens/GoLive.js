import React, { useEffect, useState } from "react";
import { BILLING_DEFAULTS } from "../lib/billing";
import StatusPill from "../components/StatusPill";
import {
  createOwnerLogin, createStripeLink, listOwners, refreshStripe, setBilling, setStatus, stripeCoverLabel,
} from "../lib/adminActions";

const number = (s) => (String(s).trim() === "" ? NaN : Number(s));

function stripeSummary(payments = {}) {
  const s = payments.stripeStatus;
  if (payments.stripeAccountId && (!s || s.ready)) return { ready: true, text: `Ready: orders pay into ${payments.stripeAccountId}` };
  if (s) {
    const needed = s.stillNeeded ? ` (${s.stillNeeded} detail${s.stillNeeded === 1 ? "" : "s"} still needed)` : "";
    return { ready: false, text: s.detailsSubmitted ? "Stripe is checking the owner's details" : `Waiting for the owner to finish${needed}` };
  }
  return { ready: false, text: "Not set up yet" };
}

/** Everything needed to take a restaurant live: status, fees, Stripe and the owner's login. */
export default function GoLive({ restaurant: r, onChanged = () => {} }) {
  const billing = { ...BILLING_DEFAULTS, ...(r.billing || {}) };
  const [fees, setFees] = useState({
    pct: String(billing.platformFeePercent), retainer: String(billing.monthlyRetainer), setup: String(billing.setupFee),
  });
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState(null);
  const [link, setLink] = useState(null);
  const [copied, setCopied] = useState(false);
  const [owners, setOwners] = useState([]);
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState(null);

  useEffect(() => {
    listOwners(r.id).then(setOwners).catch(() => setOwners([]));
  }, [r.id, login]);

  async function run(name, fn, done) {
    setBusy(name);
    setMessage(null);
    try {
      await fn();
      if (done) setMessage({ ok: true, text: done });
    } catch (e) {
      setMessage({ ok: false, text: e.message || "Something went wrong." });
    } finally {
      setBusy(null);
    }
  }

  const stripe = stripeSummary(r.payments);
  const live = r.status === "active";

  function toggleLive() {
    if (live) {
      if (!window.confirm(`Pause ${r.name}? Customers won't be able to order until you go live again.`)) return;
      return run("status", async () => { await setStatus(r.id, "paused"); onChanged(); }, `${r.name} is paused.`);
    }
    const warning = stripe.ready ? "" :
      "\n\nTheir Stripe account isn't ready yet, so order payments will go to MenuDock's Stripe account until it is.";
    if (!window.confirm(`Take ${r.name} live? Customers can order straight away.${warning}`)) return;
    return run("status", async () => { await setStatus(r.id, "active"); onChanged(); }, `${r.name} is live.`);
  }

  const feeValues = { platformFeePercent: number(fees.pct), monthlyRetainer: number(fees.retainer), setupFee: number(fees.setup) };
  const feeError =
    !(feeValues.platformFeePercent >= 0 && feeValues.platformFeePercent <= 30) ? "MenuDock fee must be between 0 and 30%." :
    !(feeValues.monthlyRetainer >= 0) ? "Monthly fee must be 0 or more." :
    !(feeValues.setupFee >= 0) ? "Setup fee must be 0 or more." : null;
  const feesChanged = feeValues.platformFeePercent !== billing.platformFeePercent ||
    feeValues.monthlyRetainer !== billing.monthlyRetainer || feeValues.setupFee !== billing.setupFee;

  const getLink = () => run("stripe", async () => {
    const res = await createStripeLink(r.id);
    setLink(res.url);
    setCopied(false);
    onChanged();
  });
  const checkStripe = () => run("check", async () => {
    const s = await refreshStripe(r.id);
    onChanged();
    setMessage({ ok: s.ready, text: s.ready ? "Stripe is ready. Orders now pay into their account." : "Not ready yet: the owner still needs to finish with Stripe." });
  });
  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); } catch { setCopied(false); }
  }
  const makeLogin = () => run("owner", async () => {
    const res = await createOwnerLogin(r.id, email);
    setLogin(res);
    setEmail("");
  });

  return (
    <div className="grid2 golive" style={{ marginTop: 16 }}>
      <div className="card">
        <h3>Taking orders</h3>
        <div className="card-sub">Whether customers can order</div>
        <div className="card-row">
          <span className="lbl">Status</span>
          <span className="val"><StatusPill status={r.status} /></span>
        </div>
        <div className="actions">
          <button className={`btn ${live ? "" : "primary"}`} onClick={toggleLive} disabled={!!busy}>
            {busy === "status" ? "Saving…" : live ? "Pause orders" : "Go live"}
          </button>
        </div>

        <h3 style={{ marginTop: 22 }}>Fees</h3>
        <div className="card-sub">Stripe costs ({stripeCoverLabel()} per order) are always passed on. Your fee goes on top.</div>
        <div className="frow">
          <div className="field"><label htmlFor="fee-pct">MenuDock fee (% of food)</label>
            <input id="fee-pct" type="number" min="0" step="0.1" value={fees.pct} onChange={(e) => setFees({ ...fees, pct: e.target.value })} /></div>
          <div className="field"><label htmlFor="fee-retainer">Monthly fee (£)</label>
            <input id="fee-retainer" type="number" min="0" value={fees.retainer} onChange={(e) => setFees({ ...fees, retainer: e.target.value })} /></div>
          <div className="field"><label htmlFor="fee-setup">Setup fee (£)</label>
            <input id="fee-setup" type="number" min="0" value={fees.setup} onChange={(e) => setFees({ ...fees, setup: e.target.value })} /></div>
        </div>
        {feeError && <div className="err">{feeError}</div>}
        <div className="actions">
          <button className="btn" onClick={() => setFees({ pct: "0", retainer: "0", setup: "0" })} disabled={!!busy}>Stripe costs only</button>
          <button className="btn primary" disabled={!!busy || !!feeError || !feesChanged}
            onClick={() => run("fees", async () => { await setBilling(r.id, feeValues); onChanged(); }, "Fees saved. They apply to new orders.")}>
            {busy === "fees" ? "Saving…" : "Save fees"}
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Stripe</h3>
        <div className="card-sub">Where order payments go</div>
        <div className="card-row">
          <span className="lbl">Account</span>
          <span className="val" data-testid="stripe-status">{stripe.text}</span>
        </div>
        <div className="actions">
          <button className="btn primary" onClick={getLink} disabled={!!busy}>
            {busy === "stripe" ? "Working…" : r.payments?.stripeStatus ? "Get owner's Stripe link" : "Create Stripe account"}
          </button>
          {r.payments?.stripeStatus && (
            <button className="btn" onClick={checkStripe} disabled={!!busy}>{busy === "check" ? "Checking…" : "Check Stripe"}</button>
          )}
        </div>
        {link && (
          <div className="linkbox">
            <div className="hint">Send this to the owner. They add their ID and bank details with Stripe. The link doesn't expire.</div>
            <div className="copyrow"><input readOnly value={link} aria-label="Owner's Stripe link" onFocus={(e) => e.target.select()} />
              <button className="btn" onClick={copy}>{copied ? "Copied" : "Copy"}</button></div>
          </div>
        )}

        <h3 style={{ marginTop: 22 }}>Owner login</h3>
        <div className="card-sub">For the kitchen tablet</div>
        {owners.length > 0 && owners.map((o) => (
          <div className="card-row" key={o.uid}><span className="lbl">Owner</span><span className="val">{o.email || o.uid}</span></div>
        ))}
        <div className="copyrow">
          <input type="email" placeholder="owner@restaurant.com" aria-label="Owner's email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button className="btn primary" onClick={makeLogin} disabled={!!busy || !email.trim()}>{busy === "owner" ? "Creating…" : "Create login"}</button>
        </div>
        {login && (
          <div className="linkbox" data-testid="owner-login">
            {login.created ? (
              <>
                <div>Sign in on the tablet with <b>{login.email}</b> and password <b className="mono">{login.temporaryPassword}</b></div>
                <div className="hint">Write this down now. It won't be shown again. They can change it with "Forgot password".</div>
              </>
            ) : (
              <div>{login.email} already had a login. It's now linked to {r.name}, and its password hasn't changed.</div>
            )}
          </div>
        )}
      </div>

      {message && <div className={`golive-msg ${message.ok ? "ok" : "err"}`} role="status">{message.text}</div>}
    </div>
  );
}
