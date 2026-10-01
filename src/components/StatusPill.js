import React from "react";
import { STATUS_LABELS } from "../lib/format";

export default function StatusPill({ status }) {
  const s = status || "pending";
  return (
    <span className={`pill ${s}`}>
      <span className="dot" />
      {STATUS_LABELS[s] || s}
    </span>
  );
}
