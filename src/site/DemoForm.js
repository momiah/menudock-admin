import React, { useState } from "react";

const SALES = ["", "Under £2k", "£2k–£5k", "£5k–£10k", "£10k–£25k", "Over £25k"];
const EMPTY = { name: "", restaurant: "", email: "", phone: "", city: "", apps: "", monthlySales: "", message: "" };

// "Book a demo": saved to Firestore (leads), shown in the admin console's Leads tab.
// Firebase loads only when someone submits, so the page itself stays light.
export default function DemoForm() {
  const [form, setForm] = useState(EMPTY);
  const [trap, setTrap] = useState(""); // honeypot: people never see or fill it
  const [state, setState] = useState("idle"); // idle | sending | sent | error
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (trap) {
      setState("sent"); // quietly drop bots
      return;
    }
    setState("sending");
    try {
      const [{ db }, { addDoc, collection, serverTimestamp }] = await Promise.all([
        import("../firebase"),
        import("firebase/firestore"),
      ]);
      const clean = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]));
      await addDoc(collection(db, "leads"), { ...clean, status: "new", source: "website", createdAt: serverTimestamp() });
      setState("sent");
      setForm(EMPTY);
    } catch (err) {
      console.error(err);
      setState("error");
    }
  };

  if (state === "sent") {
    return (
      <div className="form-card done" role="status">
        <h3>Thanks, we'll be in touch</h3>
        <p>We usually reply within one working day to arrange a time that suits you.</p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={submit}>
      <div className="form-grid">
        <label>Your name<input required maxLength={100} value={form.name} onChange={set("name")} autoComplete="name" /></label>
        <label>Restaurant<input required maxLength={120} value={form.restaurant} onChange={set("restaurant")} autoComplete="organization" /></label>
        <label>Email<input required type="email" maxLength={200} value={form.email} onChange={set("email")} autoComplete="email" /></label>
        <label>Phone<input type="tel" maxLength={30} value={form.phone} onChange={set("phone")} autoComplete="tel" /></label>
        <label>Town or city<input maxLength={80} value={form.city} onChange={set("city")} autoComplete="address-level2" /></label>
        <label>
          Monthly sales on delivery apps
          <select value={form.monthlySales} onChange={set("monthlySales")}>
            {SALES.map((v) => <option key={v} value={v}>{v || "Choose…"}</option>)}
          </select>
        </label>
        <label className="full">Which delivery apps do you use?<input maxLength={120} value={form.apps} onChange={set("apps")} placeholder="e.g. Uber Eats, Just Eat" /></label>
        <label className="full">Anything else?<textarea maxLength={2000} rows={3} value={form.message} onChange={set("message")} /></label>
        <label className="trap" aria-hidden="true">Leave this empty<input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} /></label>
      </div>
      {state === "error" && <p className="form-err" role="alert">Sorry, that didn't send. Please try again.</p>}
      <button className="btn-site primary block" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Book my demo"}
      </button>
    </form>
  );
}
