import React from "react";

const S = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" {...props} />
);

export const Store = (p) => <S {...p}><path d="M3 9l1.5-5h15L21 9M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9M4 9h16" /></S>;
export const Coin = (p) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M15 9.5a3 3 0 0 0-3-1.5c-1.7 0-3 .9-3 2s1.3 2 3 2 3 .9 3 2-1.3 2-3 2a3 3 0 0 1-3-1.5M12 6v12" /></S>;
export const Chart = (p) => <S {...p}><path d="M4 19V5M4 19h16M8 16l3-4 3 2 4-6" /></S>;
export const Bag = (p) => <S {...p}><path d="M6 7h12l-1 13H7L6 7zM9 7a3 3 0 0 1 6 0" /></S>;
export const Globe = (p) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></S>;
export const Gift = (p) => <S {...p}><rect x="3" y="8" width="18" height="13" rx="1.5" /><path d="M3 12h18M12 8v13M12 8S10 3 7.5 4 9 8 12 8zM12 8s2-5 4.5-4S15 8 12 8z" /></S>;
export const Gauge = (p) => <S {...p}><path d="M12 14l4-4M5 19a9 9 0 1 1 14 0z" /></S>;
export const Grid = (p) => <S {...p}><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></S>;
export const Fork = (p) => <S {...p}><path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3c-1.5 1-2.5 3-2.5 6s1 4 2.5 4 2.5-1 2.5-4-1-5-2.5-6zM17 13v8" /></S>;
export const Card = (p) => <S {...p}><rect x="2" y="5" width="20" height="14" rx="2.5" /><path d="M2 10h20" /></S>;
export const Cog = (p) => <S {...p}><circle cx="12" cy="12" r="3.2" /><path d="M19.4 12a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2l-.4-2.6H9.5l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h4.9l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.07-.4.1-.8.1-1.2z" /></S>;
export const Plus = (p) => <S strokeWidth="2.2" {...p}><path d="M12 5v14M5 12h14" /></S>;
export const Search = (p) => <S {...p}><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></S>;
export const Chevron = (p) => <S {...p}><path d="M9 6l6 6-6 6" /></S>;
export const ChevronLeft = (p) => <S {...p}><path d="M15 6l-6 6 6 6" /></S>;
export const X = (p) => <S {...p}><path d="M6 6l12 12M18 6L6 18" /></S>;
export const Image = (p) => <S {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="9" cy="9" r="2" /><path d="M21 15l-5-5L5 21" /></S>;
export const Upload = (p) => <S {...p}><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></S>;
export const Bolt = (p) => <S {...p}><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></S>;
export const LogOut = (p) => <S {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></S>;
export const Clock = (p) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 2" /></S>;
