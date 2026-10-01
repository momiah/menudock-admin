import React, { useState } from "react";
import { doc, setDoc, writeBatch, serverTimestamp, collection } from "firebase/firestore";
import { db } from "../firebase";
import { uploadImage } from "../lib/upload";
import { BILLING_DEFAULTS } from "../lib/billing";
import { Bolt, X, Upload, Image, Plus } from "../components/Icons";

const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const blank = { category: "Mains", name: "", price: "", imageFile: null, imagePreview: "" };

export default function OnboardDrawer({ open, onClose, onSaved }) {
  const [f, setF] = useState(form());
  const [items, setItems] = useState([{ ...blank }]);
  const [logo, setLogo] = useState(null);
  const [hero, setHero] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  function form() {
    return {
      name: "", slug: "", phone: "", instagram: "", addressLine: "", city: "", postcode: "",
      primary: "#0E7C7B", secondary: "#13324f", accent: "#eb6834",
      orderTypes: "Collection & Delivery", radius: "2", postcodes: "", currency: "GBP",
      freeOver: "20", fee: "2.50",
      feePct: String(BILLING_DEFAULTS.platformFeePercent), retainer: String(BILLING_DEFAULTS.monthlyRetainer), setup: String(BILLING_DEFAULTS.setupFee),
      stripeAccountId: "", domain: "",
    };
  }
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  function pickImage(setter) {
    return (e) => {
      const file = e.target.files[0];
      if (file) setter({ file, preview: URL.createObjectURL(file) });
    };
  }
  function setItem(i, patch) { setItems(items.map((it, j) => (j === i ? { ...it, ...patch } : it))); }
  function pickItemImage(i) {
    return (e) => {
      const file = e.target.files[0];
      if (file) setItem(i, { imageFile: file, imagePreview: URL.createObjectURL(file) });
    };
  }

  async function save() {
    setErr(null);
    const slug = slugify(f.slug || f.name);
    if (!f.name.trim() || !slug) { setErr("Name and slug are required."); return; }
    setBusy(true);
    try {
      const id = slug;
      const theme = {
        colors: { primary: f.primary, secondary: f.secondary, accent: f.accent, background: "#ffffff", text: "#0a0a0a", navBar: "#333333", navBarText: "#ffffff" },
        fonts: { heading: "system-ui, sans-serif", body: "system-ui, sans-serif" },
        logoUrl: "", heroImageUrl: "",
      };
      if (logo?.file) theme.logoUrl = await uploadImage(`restaurants/${id}/logo`, logo.file);
      if (hero?.file) theme.heroImageUrl = await uploadImage(`restaurants/${id}/hero`, hero.file);

      const restaurant = {
        slug, name: f.name.trim(), status: "pending",
        contact: { phone: f.phone, email: "", instagram: f.instagram.replace(/^@/, "") },
        address: { line1: f.addressLine, city: f.city, postcode: f.postcode, formatted: [f.addressLine, f.city, f.postcode].filter(Boolean).join(", ") },
        location: { lat: null, lng: null, mapsEmbedUrl: "", placeId: "" },
        theme,
        ordering: {
          orderTypes: f.orderTypes === "Collection only" ? ["Collection"] : f.orderTypes === "Delivery only" ? ["Delivery"] : ["Collection", "Delivery"],
          deliveryRadiusMiles: Number(f.radius) || 0,
          allowedPostcodePrefixes: f.postcodes.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean),
          minOrder: 0, freeDeliveryThreshold: Number(f.freeOver) || 0, deliveryFee: Number(f.fee) || 0,
          currency: f.currency, collectionAddress: [f.addressLine, f.city, f.postcode].filter(Boolean).join(", "),
        },
        payments: { provider: "stripe-connect", stripeAccountId: f.stripeAccountId.trim(), shippingRateId: "" },
        billing: { platformFeePercent: Number(f.feePct) || 0, monthlyRetainer: Number(f.retainer) || 0, setupFee: Number(f.setup) || 0, currency: f.currency },
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "restaurants", id), restaurant, { merge: true });

      // Menu: upload any item images, then group items into category docs.
      const withImages = await Promise.all(items.filter((it) => it.name.trim()).map(async (it) => {
        let imageUrl = "";
        if (it.imageFile) imageUrl = await uploadImage(`restaurants/${id}/menu/${slugify(it.name)}`, it.imageFile);
        return { category: it.category.trim() || "Menu", name: it.name.trim(), price: Number(it.price) || 0, imageUrl, extras: [], protein: [] };
      }));
      const byCat = {};
      const order = [];
      withImages.forEach((it) => {
        if (!byCat[it.category]) { byCat[it.category] = []; order.push(it.category); }
        byCat[it.category].push({ name: it.name, price: it.price, imageUrl: it.imageUrl, description: "", extras: it.extras, protein: it.protein });
      });
      const batch = writeBatch(db);
      order.forEach((cat, idx) => {
        const cid = slugify(cat);
        batch.set(doc(collection(db, "restaurants", id, "menu"), cid), { category: cat, order: idx + 1, items: byCat[cat] });
      });
      await batch.commit();

      if (f.domain.trim()) await setDoc(doc(db, "domains", f.domain.trim()), { restaurantId: id });

      setBusy(false);
      setF(form()); setItems([{ ...blank }]); setLogo(null); setHero(null);
      onSaved && onSaved(id);
    } catch (e) {
      setBusy(false);
      setErr(e.message || "Something went wrong.");
    }
  }

  return (
    <>
      <div className={`scrim ${open ? "open" : ""}`} onClick={busy ? undefined : onClose} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="drawer-head">
          <div><h2>Onboard a restaurant</h2><p>One record configures their website, loyalty app &amp; owner dashboard.</p></div>
          <button className="x" onClick={onClose} aria-label="Close"><X width="20" height="20" /></button>
        </div>

        <div className="drawer-body">
          <div className="feeds"><Bolt /><div>Everything here writes one <span className="mono">restaurants/{"{id}"}</span> record — instantly powering their website, loyalty app and owner dashboard. No code, no new deploy.</div></div>

          <Section n="1" title="Identity">
            <div className="frow">
              <Field label="Restaurant name"><input value={f.name} onChange={set("name")} placeholder="e.g. Pizza Loco" /></Field>
              <Field label="Slug"><input value={f.slug} onChange={set("slug")} placeholder={slugify(f.name) || "pizza-loco"} /></Field>
              <Field label="Phone"><input value={f.phone} onChange={set("phone")} placeholder="020 …" /></Field>
              <Field label="Instagram"><input value={f.instagram} onChange={set("instagram")} placeholder="@handle" /></Field>
              <Field label="Address" full><input value={f.addressLine} onChange={set("addressLine")} placeholder="Street" /></Field>
              <Field label="City"><input value={f.city} onChange={set("city")} /></Field>
              <Field label="Postcode"><input value={f.postcode} onChange={set("postcode")} /></Field>
            </div>
          </Section>

          <Section n="2" title="Branding & theme">
            <div className="colorrow">
              <label className="cf">Primary <input type="color" value={f.primary} onChange={set("primary")} /></label>
              <label className="cf">Secondary <input type="color" value={f.secondary} onChange={set("secondary")} /></label>
              <label className="cf">Accent <input type="color" value={f.accent} onChange={set("accent")} /></label>
            </div>
            <div className="frow">
              <Field label="Logo"><Drop file={logo} onPick={pickImage(setLogo)} icon={<Upload />} text="Upload logo" /></Field>
              <Field label="Hero image"><Drop file={hero} onPick={pickImage(setHero)} icon={<Image />} text="Upload hero" /></Field>
            </div>
          </Section>

          <Section n="3" title="Ordering rules">
            <div className="frow">
              <Field label="Order types"><select value={f.orderTypes} onChange={set("orderTypes")}><option>Collection & Delivery</option><option>Collection only</option><option>Delivery only</option></select></Field>
              <Field label="Delivery radius (mi)"><input type="number" value={f.radius} onChange={set("radius")} /></Field>
              <Field label="Allowed postcodes" full><input value={f.postcodes} onChange={set("postcodes")} placeholder="EN1, EN2, EN3" /></Field>
              <Field label="Currency"><select value={f.currency} onChange={set("currency")}><option>GBP</option><option>EUR</option><option>USD</option></select></Field>
              <Field label="Free delivery over"><input value={f.freeOver} onChange={set("freeOver")} placeholder="20" /></Field>
              <Field label="Delivery fee"><input value={f.fee} onChange={set("fee")} placeholder="2.50" /></Field>
            </div>
          </Section>

          <Section n="4" title="Payments & your fee">
            <div className="frow">
              <Field label="Platform fee (%)"><input type="number" value={f.feePct} onChange={set("feePct")} /></Field>
              <Field label="Monthly retainer (£)"><input type="number" value={f.retainer} onChange={set("retainer")} /></Field>
              <Field label="Setup fee (£)"><input type="number" value={f.setup} onChange={set("setup")} /></Field>
              <Field label="Stripe account id"><input value={f.stripeAccountId} onChange={set("stripeAccountId")} placeholder="acct_… (optional now)" /></Field>
              <Field label="Custom domain" full><input value={f.domain} onChange={set("domain")} placeholder="order.client.com (optional)" /></Field>
            </div>
            <div className="hint">Funds settle to the restaurant's Stripe account; your 5% fee is taken per order. Retainer &amp; setup are billed by you.</div>
          </Section>

          <Section n="5" title="Menu">
            <div className="mibuilder">
              {items.map((it, i) => (
                <div className="milineitem" key={i}>
                  <input placeholder="Item name" value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} />
                  <input placeholder="Category" value={it.category} onChange={(e) => setItem(i, { category: e.target.value })} />
                  <input placeholder="£" value={it.price} onChange={(e) => setItem(i, { price: e.target.value })} />
                  <label className={`imgpick ${it.imagePreview ? "has" : ""}`} title="Item image">
                    {it.imagePreview ? <img src={it.imagePreview} alt="" /> : <Image width="15" height="15" />}
                    <input type="file" accept="image/*" onChange={pickItemImage(i)} />
                  </label>
                  <button className="x" type="button" aria-label="Remove" onClick={() => setItems(items.filter((_, j) => j !== i))}><X width="16" height="16" /></button>
                </div>
              ))}
            </div>
            <button className="btn addmi" type="button" onClick={() => setItems([...items, { ...blank }])}><Plus width="15" height="15" />Add item</button>
          </Section>
        </div>

        <div className="drawer-foot">
          {err && <span className="err">{err}</span>}
          <button className="btn" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn primary" onClick={save} disabled={busy}>{busy ? "Creating…" : "Create restaurant"}</button>
        </div>
      </aside>
    </>
  );
}

function Section({ n, title, children }) {
  return (
    <div className="fsec">
      <div className="fsec-t"><span className="n">{n}</span>{title}</div>
      {children}
    </div>
  );
}
function Field({ label, full, children }) {
  return <div className={`field ${full ? "full" : ""}`}><label>{label}</label>{children}</div>;
}
function Drop({ file, onPick, icon, text }) {
  return (
    <label className={`drop ${file ? "has" : ""}`}>
      {file ? <img src={file.preview} alt="" style={{ maxHeight: 54, borderRadius: 8 }} /> : icon}
      {file ? "Change" : text}
      <input type="file" accept="image/*" onChange={onPick} />
    </label>
  );
}
