import React, { useState } from "react";
import "./site.css";
import { DEMO_URL, PRICING } from "./config";
import { gbp, savings } from "./savings";
import DemoForm from "./DemoForm";
import DeviceShowcase from "./DeviceShowcase";

// The public MenuDock website (menudock.com). The admin console lives at /admin.
export default function Site() {
  return (
    <div className="site">
      <Nav />
      <main>
        <Hero />
        <Calculator />
        <HowItWorks />
        <Features />
        <Standard />
        <Pricing />
        <Faq />
        <section className="section demo" id="demo">
          <div className="wrap demo-grid">
            <div>
              <p className="eyebrow">Book a demo</p>
              <h2>See it with your own menu</h2>
              <p className="lead">
                Tell us a little about your restaurant and we'll show you MenuDock set up the way you'd use it, and work
                out what you'd save.
              </p>
              <ul className="ticks">
                <li>15 minutes, no obligation</li>
                <li>We set everything up for you</li>
                <li>Keep using the delivery apps alongside</li>
              </ul>
            </div>
            <DemoForm />
          </div>
        </section>
      </main>
      <footer className="foot">
        <div className="wrap foot-row">
          <Logo />
          <span>© {new Date().getFullYear()} MenuDock. Online ordering for independent restaurants.</span>
        </div>
      </footer>
    </div>
  );
}

function Logo() {
  return (
    <span className="brand">
      <span className="mark" aria-hidden="true">M</span>
      <span className="word">Menu<span>Dock</span></span>
    </span>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [
    ["#savings", "Savings"],
    ["#how", "How it works"],
    ["#features", "Features"],
    ["#pricing", "Pricing"],
    ["#faq", "FAQ"],
  ];
  return (
    <header className="site-nav">
      <div className="wrap nav-row">
        <a href="/" className="nav-home" aria-label="MenuDock home"><Logo /></a>
        <nav className={`nav-links ${open ? "open" : ""}`} aria-label="Main">
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <a className="btn-site primary small" href="#demo" onClick={() => setOpen(false)}>Book a demo</a>
        </nav>
        <button className="nav-toggle" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <p className="eyebrow">For independent restaurants &amp; takeaways</p>
          <h1>Your orders. Your customers. <em>Your profit.</em></h1>
          <p className="lead">
            Take orders through your own branded website and loyalty app, and stop handing up to a third of every order
            to the delivery apps. MenuDock charges {PRICING.orderFeePercent}% per order plus a flat monthly fee.
          </p>
          <div className="cta-row">
            <a className="btn-site primary" href="#demo">Book a demo</a>
            <a className="btn-site ghost" href={DEMO_URL} target="_blank" rel="noreferrer">Try a live demo restaurant ↗</a>
          </div>
          <p className="fine">Set up for you · Card payments straight to your bank · Keep the apps for new customers</p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="phone">
            <div className="phone-top">order.yourrestaurant.co.uk</div>
            <div className="track">
              <div className="track-num">Order #1004</div>
              <div className="track-title">Ready to collect</div>
              <div className="track-pts">⭐ +18 points earned</div>
              <div className="steps">
                <span className="on" /><span className="on" /><span className="on" /><span />
              </div>
            </div>
          </div>
          <div className="tablet">
            <div className="tab-row head"><span>Live orders</span><span className="dot" /></div>
            <div className="tab-row"><b>#1005</b><span>Collection</span><span className="pill new">New</span></div>
            <div className="tab-row"><b>#1004</b><span>Collection</span><span className="pill ready">Ready</span></div>
            <div className="tab-row"><b>#1003</b><span>Delivery</span><span className="pill out">Out</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Calculator() {
  const [sales, setSales] = useState(8000);
  const [rate, setRate] = useState(30);
  const [delivery, setDelivery] = useState(false);
  const s = savings({ monthlySales: sales, commissionPercent: rate, delivery });

  return (
    <section className="section alt" id="savings">
      <div className="wrap">
        <p className="eyebrow">Savings calculator</p>
        <h2>How much are the apps costing you?</h2>
        <p className="lead">Move your regulars to your own ordering, and see what you keep.</p>
        <div className="calc">
          <div className="calc-inputs">
            <label className="calc-field">
              <span>Monthly orders through delivery apps</span>
              <strong>{gbp(sales)}</strong>
              <input type="range" min="1000" max="50000" step="500" value={sales} onChange={(e) => setSales(Number(e.target.value))} aria-label="Monthly orders through delivery apps" />
            </label>
            <label className="calc-field">
              <span>Commission you pay the apps</span>
              <strong>{rate}%</strong>
              <input type="range" min="10" max="40" step="1" value={rate} onChange={(e) => setRate(Number(e.target.value))} aria-label="Commission you pay the apps" />
            </label>
            <label className="calc-check">
              <input type="checkbox" checked={delivery} onChange={(e) => setDelivery(e.target.checked)} />
              <span>Include the Delivery Service for my own drivers (+£{PRICING.deliveryAddOn}/month)</span>
            </label>
          </div>
          <div className="calc-out" aria-live="polite">
            <div className="calc-line"><span>Delivery apps</span><b>{gbp(s.marketplace)}/mo</b></div>
            <div className="calc-line"><span>MenuDock</span><b>{gbp(s.menudock)}/mo</b></div>
            <div className="calc-save">
              <span>{s.perMonth >= 0 ? "You'd keep" : "Difference"}</span>
              <b data-testid="saving-month">{gbp(s.perMonth)} a month</b>
              <small data-testid="saving-year">{gbp(s.perYear)} a year</small>
            </div>
            <p className="fine">
              MenuDock: {PRICING.orderFeePercent}% per order + £{PRICING.monthly + (delivery ? PRICING.deliveryAddOn : 0)}/month.
              Based on the same orders moving to your own ordering.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    ["We set you up", "Your ordering website on your own web address, your own loyalty app for customers' phones, your menu and photos, and a kitchen tablet posted to you ready to plug in."],
    ["Customers order direct", "From your website or your own loyalty app. They pay by card and the money goes straight to your Stripe account."],
    ["You cook, they track", "The tablet rings for every new order. One tap moves it on, and your customer follows it live with an order number."],
  ];
  return (
    <section className="section" id="how">
      <div className="wrap">
        <p className="eyebrow">How it works</p>
        <h2>Live in days, not months</h2>
        <ol className="how">
          {steps.map(([title, body], i) => (
            <li key={title}>
              <span className="how-num">{i + 1}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

// The three things that make MenuDock different, shown with the device picture.
const FEATURES = [
  ["🌐", "Your own ordering website", "Your name, colours, logo and menu on your own web address. Customers order for collection or delivery and pay by card."],
  ["📟", "Kitchen tablet", "Every new order appears instantly with a loud alarm. One tap moves it on: preparing, ready or out for delivery, done."],
  ["⭐", "Your own loyalty app", "An app with your name on it. Customers order, track their food and earn points on every order, so they come back to you."],
];

// Included by default, but expected rather than the reason to switch.
const STANDARD = [
  ["📍", "Live order tracking", "Every order gets a number, and customers watch it move from received to ready, so the phone stops ringing."],
  ["🍽️", "Menu control", "Change items, prices and photos from the tablet in seconds. Upload a photo or PDF of your menu and it becomes your online menu."],
  ["📇", "Your customer data", "Names, emails and numbers belong to you, not to a marketplace, so you can bring customers back."],
  ["💷", "Paid straight to your bank", "Customers pay by card through Stripe, and the money goes to your own account. We never hold your takings."],
];

function Features() {
  return (
    <section className="section alt" id="features">
      <div className="wrap">
        <p className="eyebrow">Everything included</p>
        <h2>One package. Your brand on all of it.</h2>
        <div className="features three">
          {FEATURES.map(([icon, title, body]) => (
            <div className="feature" key={title}>
              <span className="feature-icon" aria-hidden="true">{icon}</span>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          ))}
        </div>
        <DeviceShowcase />
      </div>
    </section>
  );
}

function Standard() {
  return (
    <section className="section" id="standard">
      <div className="wrap">
        <p className="eyebrow">Included as standard</p>
        <h2>The everyday essentials, built in</h2>
        <div className="standard">
          {STANDARD.map(([icon, title, body]) => (
            <div className="std" key={title}>
              <span className="std-icon" aria-hidden="true">{icon}</span>
              <div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="addon">
          <div>
            <p className="eyebrow">Add-on · +£{PRICING.deliveryAddOn}/month</p>
            <h3>Delivery Service for your own drivers</h3>
            <p>
              Your drivers use the MenuDock Driver app. Invite them with a QR code or link, or let them request to join
              your fleet. They're notified when a delivery is being prepared, you set how they're paid, and they're paid
              weekly for every trip.
            </p>
          </div>
          <ul className="ticks">
            <li>Invite by QR code or link</li>
            <li>Instant job notifications</li>
            <li>Weekly driver pay, worked out for you</li>
            <li>Drivers can work for several restaurants</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="section alt" id="pricing">
      <div className="wrap">
        <p className="eyebrow">Pricing</p>
        <h2>Simple, and a fraction of app commission</h2>
        <div className="prices">
          <div className="price-card main">
            <h3>MenuDock</h3>
            <div className="price"><b>£{PRICING.monthly}</b><span>/month</span></div>
            <div className="price-sub">+ {PRICING.orderFeePercent}% per order · £{PRICING.setupFee} one-off setup</div>
            <ul className="ticks">
              <li>Branded ordering website on your domain</li>
              <li>Kitchen tablet, set up and posted to you</li>
              <li>Live order tracking for customers</li>
              <li>Menu control, photos and menu upload</li>
              <li>Your own loyalty app with points</li>
              <li>Card payments straight to your bank</li>
            </ul>
            <a className="btn-site primary block" href="#demo">Book a demo</a>
          </div>
          <div className="price-card">
            <h3>With Delivery Service</h3>
            <div className="price"><b>£{PRICING.monthly + PRICING.deliveryAddOn}</b><span>/month</span></div>
            <div className="price-sub">+ {PRICING.orderFeePercent}% per order · £{PRICING.setupFee} one-off setup</div>
            <ul className="ticks">
              <li>Everything in MenuDock</li>
              <li>MenuDock Driver app for your own drivers</li>
              <li>Job notifications and live delivery status</li>
              <li>Weekly driver pay, worked out for you</li>
            </ul>
            <a className="btn-site ghost block" href="#demo">Talk to us</a>
          </div>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  ["Do I have to leave Uber Eats, Just Eat or Deliveroo?",
    "No. Most restaurants keep the apps for new customers and move their regulars to their own ordering, with a QR code or leaflet in every bag, their link on Google and Instagram, and points for ordering direct."],
  ["Who delivers the food?",
    "Your own drivers. MenuDock doesn't supply couriers. The Delivery Service add-on gives your drivers an app for jobs and weekly pay. No drivers? Collection orders are the simplest, biggest saving."],
  ["How do I get paid?",
    "Customers pay by card through Stripe, and payouts go straight to your own Stripe account and on to your bank. MenuDock never holds your takings."],
  ["Do I need any technical knowledge?",
    "No. We set up your website, menu and tablet for you. After that, everything day to day happens on the tablet."],
  ["Can I use my own web address?",
    "Yes. Your ordering site runs on your own domain, for example order.yourrestaurant.co.uk, with your name and branding."],
];

function Faq() {
  return (
    <section className="section" id="faq">
      <div className="wrap narrow">
        <p className="eyebrow">FAQ</p>
        <h2>Questions restaurants ask us</h2>
        <div className="faq">
          {FAQS.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
