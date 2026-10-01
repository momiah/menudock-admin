import { useEffect, useState } from "react";
import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { summarise } from "./performance";
import { earnings } from "./billing";

// All restaurants, each enriched with performance (from the orders collection) + earnings.
export function useRestaurants() {
  const [data, setData] = useState({ restaurants: [], loading: true, error: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [rSnap, oSnap] = await Promise.all([
          getDocs(collection(db, "restaurants")),
          getDocs(collection(db, "orders")),
        ]);
        const ordersByR = {};
        oSnap.docs.forEach((d) => {
          const o = d.data();
          const rid = o.restaurantId || "_unknown";
          (ordersByR[rid] = ordersByR[rid] || []).push(o);
        });
        const restaurants = rSnap.docs.map((d) => {
          const r = { id: d.id, ...d.data() };
          const perf = summarise(ordersByR[d.id] || []);
          const earn = earnings(r, perf.gmv);
          return { ...r, perf, earn };
        });
        if (alive) setData({ restaurants, loading: false, error: null });
      } catch (e) {
        if (alive) setData({ restaurants: [], loading: false, error: e.message });
      }
    })();
    return () => { alive = false; };
  }, []);

  return data;
}

// One restaurant with its menu + performance + earnings.
export function useRestaurant(id) {
  const [data, setData] = useState({ restaurant: null, menu: [], loading: true, error: null });

  useEffect(() => {
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const rSnap = await getDoc(doc(db, "restaurants", id));
        if (!rSnap.exists()) throw new Error("Restaurant not found");
        const r = { id: rSnap.id, ...rSnap.data() };

        let menu = [];
        try {
          const mSnap = await getDocs(query(collection(db, "restaurants", id, "menu"), orderBy("order")));
          menu = mSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        } catch {
          const mSnap = await getDocs(collection(db, "restaurants", id, "menu"));
          menu = mSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        }

        const oSnap = await getDocs(query(collection(db, "orders"), where("restaurantId", "==", id)));
        const perf = summarise(oSnap.docs.map((d) => d.data()));
        const earn = earnings(r, perf.gmv);

        if (alive) setData({ restaurant: { ...r, perf, earn }, menu, loading: false, error: null });
      } catch (e) {
        if (alive) setData({ restaurant: null, menu: [], loading: false, error: e.message });
      }
    })();
    return () => { alive = false; };
  }, [id]);

  return data;
}
