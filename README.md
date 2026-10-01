# MenuDock Admin Console

The MenuDock platform operator console — the super-admin app that sits above the
restaurant website and owner dashboard. From here you see every onboarded restaurant,
drill into each one's full record and performance, and onboard new clients by writing
config (no code, no new deploy).

It reads/writes the **shared platform Firebase project** — the same project the
customer website (`restaurant-site`) and owner dashboard (`restaurant-dashboard`) use.

## What it does

- **Restaurants tab** — a live list of all clients with status, GMV, orders and your
  earnings; search; and a **+ Onboard restaurant** button.
- **Restaurant detail** — full config (identity, theme, ordering rules, Stripe), a menu
  preview, performance (GMV / orders / AOV, weekly revenue + orders charts) and your
  earnings breakdown, plus links to that restaurant's **website / loyalty app / owner
  dashboard**.
- **Onboard flow** — a form that writes the `restaurants/{id}` record, menu subcollection,
  logo/hero/item images (to Firebase Storage) and an optional `domains/{host}` mapping.

## Money model

Earnings per restaurant = **£300 setup (one-off) + £129 × months active + 5% of GMV**.
Defaults live in `src/lib/billing.js`; each restaurant can override them via its
`billing` field.

## Access

The console requires a MenuDock **admin**. Production uses a Firebase Auth custom claim:

```js
// one-off, via the Firebase Admin SDK
admin.auth().setCustomUserClaims(uid, { admin: true });
```

As a fallback (e.g. before claims are set up) an `admins/{uid}` document also grants the
app UI in. Either way, the platform Firestore rules (`restaurant-site/firestore.rules`)
grant full access only to users with the `admin` claim — set the claim for real use.

## Run locally

```bash
cp .env.example .env.local   # fill in the platform Firebase project
npm install
npm start
```

## Stack

Create React App · Firebase (Firestore, Auth, Storage) · inline-SVG charts. No chart
library — charts are hand-built and colour-validated for light/dark and colour-blindness.
