import React, { useEffect, useState } from "react";
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const STATUSES = ["new", "contacted", "demo booked", "won", "lost"];

// "Book a demo" requests from the public website, newest first.
export default function Leads() {
  const [leads, setLeads] = useState(null);
  const [error, setError] = useState(null);

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(200)),
        (snap) => setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        (e) => setError(e.message)
      ),
    []
  );

  const setStatus = (id, status) => updateDoc(doc(db, "leads", id), { status }).catch((e) => setError(e.message));

  if (error) return <div className="placeholder"><div>Couldn't load leads: {error}</div></div>;
  if (!leads) return <div className="placeholder"><div className="spinner" /></div>;
  if (leads.length === 0) {
    return (
      <div className="placeholder">
        <div><strong>No demo requests yet</strong></div>
        <div>Requests from the “Book a demo” form on the website appear here.</div>
      </div>
    );
  }

  return (
    <div className="leads">
      {leads.map((l) => (
        <div className="card lead" key={l.id}>
          <div className="lead-head">
            <div>
              <h3>{l.restaurant || "—"}</h3>
              <div className="card-sub">
                {l.name}
                {l.city ? ` · ${l.city}` : ""}
                {l.createdAt?.toDate ? ` · ${l.createdAt.toDate().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}` : ""}
              </div>
            </div>
            <select value={l.status || "new"} onChange={(e) => setStatus(l.id, e.target.value)} aria-label={`Status for ${l.restaurant}`}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="card-row"><span className="lbl">Email</span><a className="val" href={`mailto:${l.email}`}>{l.email}</a></div>
          {l.phone ? <div className="card-row"><span className="lbl">Phone</span><a className="val" href={`tel:${l.phone}`}>{l.phone}</a></div> : null}
          {l.apps ? <div className="card-row"><span className="lbl">Delivery apps</span><span className="val">{l.apps}</span></div> : null}
          {l.monthlySales ? <div className="card-row"><span className="lbl">Monthly app sales</span><span className="val">{l.monthlySales}</span></div> : null}
          {l.message ? <p className="lead-msg">{l.message}</p> : null}
        </div>
      ))}
    </div>
  );
}
