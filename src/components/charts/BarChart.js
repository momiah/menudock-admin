import React, { useRef, useState } from "react";

// Simple bar chart with per-bar hover tooltip.
export default function BarChart({ values, labels, unit = "" }) {
  const W = 560, H = 200, pad = { l: 40, r: 14, t: 14, b: 26 };
  const svgRef = useRef(null);
  const [tip, setTip] = useState(null); // { i, x, y }

  const n = values.length;
  const max = Math.max(...values, 1);
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const gap = iw / n, bw = gap * 0.62;
  const Y = (v) => pad.t + ih * (1 - v / max);

  const ticks = 3;
  const gridlines = [];
  for (let t = 0; t <= ticks; t++) {
    const v = (max * t) / ticks, y = Y(v);
    gridlines.push(
      <g key={t}>
        <line className="gridline" x1={pad.l} y1={y} x2={W - pad.r} y2={y} />
        <text className="axislbl" x={pad.l - 8} y={y + 4} textAnchor="end">{Math.round(v)}</text>
      </g>
    );
  }

  function onMove(e, i) {
    const rect = svgRef.current.getBoundingClientRect();
    setTip({ i, x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div className="chart-wrap">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
        {gridlines}
        {values.map((v, i) => {
          const x = pad.l + gap * i + (gap - bw) / 2, y = Y(v), h = Math.max(pad.t + ih - y, 0);
          return (
            <rect key={i} x={x} y={y} width={bw} height={h} rx="3"
              fill={tip && tip.i === i ? "var(--series-2)" : "var(--series-1)"}
              onMouseMove={(e) => onMove(e, i)}
              onMouseLeave={() => setTip(null)}
            />
          );
        })}
        <line className="baseline" x1={pad.l} y1={Y(0)} x2={W - pad.r} y2={Y(0)} />
        {labels.map((L, i) => {
          const x = pad.l + gap * i + gap / 2;
          return (i % 2 === 0 || i === n - 1) ? (
            <text key={i} className="axislbl" x={x} y={H - 8} textAnchor="middle">{L}</text>
          ) : null;
        })}
      </svg>
      {tip && (
        <div className="tip" style={{ opacity: 1, left: tip.x, top: tip.y - 10 }}>
          {values[tip.i]}{unit ? " " + unit : ""}<span className="tip-sub">{labels[tip.i]}</span>
        </div>
      )}
    </div>
  );
}
