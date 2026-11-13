import React from "react";

// Illustration of the three things a restaurant gets, drawn in HTML/CSS so it stays
// sharp at any size: their ordering website (laptop), the kitchen tablet, and their
// loyalty app (phone). Everything is sized in em, and the container's font-size
// scales with the page width, so the whole picture shrinks evenly on phones.
// The restaurant ("Nonna's Kitchen") is made up.
const MENU = [
  ["🍕", "Margherita", "£9.50", "#F6D7C3"],
  ["🍝", "Spaghetti Carbonara", "£11.00", "#F3E3B5"],
  ["🥗", "Burrata Salad", "£8.50", "#D9EBCF"],
  ["🍰", "Tiramisu", "£5.50", "#EBD9CC"],
];

export default function DeviceShowcase() {
  return (
    <figure className="showcase" role="img" aria-label="A restaurant's own ordering website on a laptop, the MenuDock kitchen tablet showing live orders, and the restaurant's loyalty app on a phone">
      <div className="sc-stage" aria-hidden="true">
        {/* Laptop: the restaurant's ordering website */}
        <div className="sc-laptop">
          <div className="sc-laptop-screen">
            <div className="sc-browser">
              <span className="sc-dots"><i /><i /><i /></span>
              <span className="sc-url">order.nonnaskitchen.co.uk</span>
            </div>
            <div className="sc-web">
              <div className="sc-web-nav">
                <b>Nonna's Kitchen</b>
                <span>Menu</span><span>About</span>
                <span className="sc-basket">Basket · 2</span>
              </div>
              <div className="sc-web-hero">
                <div>
                  <b>Fresh pasta &amp; wood-fired pizza</b>
                  <span>Order for collection or delivery</span>
                </div>
              </div>
              <div className="sc-chips"><i className="on">Pizza</i><i>Pasta</i><i>Salads</i><i>Desserts</i></div>
              <div className="sc-menu">
                {MENU.map(([emoji, name, price, bg]) => (
                  <div className="sc-item" key={name}>
                    <div className="sc-item-img" style={{ background: bg }}><span>{emoji}</span></div>
                    <b>{name}</b>
                    <span>{price}</span>
                    <i>Add</i>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="sc-laptop-base" />
        </div>

        {/* Tablet: the kitchen dashboard */}
        <div className="sc-tablet">
          <div className="sc-tab">
            <div className="sc-tab-side">
              <b>Nonna's</b>
              <span className="on">Live orders (3)</span>
              <span>Completed</span>
              <span>Menu</span>
            </div>
            <div className="sc-tab-main">
              <div className="sc-tab-head"><span>Order</span><span>Type</span><span>Status</span><span>Next step</span></div>
              <div className="sc-tab-row">
                <b>#1042</b><span>Collection</span><i className="new">New</i><em>Start preparing</em>
              </div>
              <div className="sc-tab-row">
                <b>#1041</b><span>Delivery</span><i className="prep">Preparing</i><em>Out for delivery</em>
              </div>
              <div className="sc-tab-row">
                <b>#1040</b><span>Collection</span><i className="ready">Ready</i><em>Mark collected</em>
              </div>
            </div>
          </div>
        </div>

        {/* Phone: the restaurant's loyalty app */}
        <div className="sc-phone">
          <div className="sc-app">
            <div className="sc-app-head"><b>Nonna's Kitchen</b><span>☰</span></div>
            <div className="sc-points">
              <span>Your points</span>
              <b>240 pts</b>
              <div className="sc-bar"><i /></div>
              <small>260 pts to a free dessert 🎉</small>
            </div>
            <div className="sc-app-title">Order again</div>
            {MENU.slice(0, 2).map(([emoji, name, price, bg]) => (
              <div className="sc-app-item" key={name}>
                <div style={{ background: bg }}><span>{emoji}</span></div>
                <span><b>{name}</b><small>{price} · +{parseInt(price.slice(1), 10)} pts</small></span>
                <i>+</i>
              </div>
            ))}
            <div className="sc-app-track">
              <small>Order #1040</small>
              <b>Ready to collect</b>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="sc-caption">
        <span><b>Website</b> on your own web address</span>
        <span><b>Kitchen tablet</b> for live orders</span>
        <span><b>Loyalty app</b> with your name on it</span>
      </figcaption>
    </figure>
  );
}
