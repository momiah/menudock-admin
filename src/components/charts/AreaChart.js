import React, { useRef, useState } from "react";

// Single-series area chart with a crosshair + tooltip. viewBox-based, responsive.
export default function AreaChart({ values, labels, format = (v) => v }) {
  const W = 560, H = 210, pad = { l: 46, r: 14, t: 14, b: 26 };
  const svgRef = useRef(null);
  const [hover, setHover] = useState(null);

  const n = values.length;
  const max = Math.max(...values, 1);
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const X = (i) => pad.l + (n === 1 ? iw / 2 : (iw * i) / (n - 1));
  const Y = (v) => pad.t + ih * (1 - v / max);

  const ticks = 4;
  const gridlines = [];
  for (let t = 0; t <= ticks; t++) {
    const v = (max * t) / ticks, y = Y(v);
    gridlines.push(
      <g key={t}>
        <line className="gridline" x1={pad.l} y1={y} x2={W - pad.r} y2={y} />
        <text className="axislbl" x={pad.l - 8} y={y + 4} textAnchor="end">{format(v)}</text>
      </g>
    );
  }
  const line = values.map((v, i) => `${i ? "L" : "M"}${X(i)},${Y(v)}`).join(" ");
  const area = `M${X(0)},${Y(0)} ` + values.map((v, i) => `L${X(i)},${Y(v)}`).join(" ") + ` L${X(n - 1)},${Y(0)} Z`;

  function onMove(e) {
    const rect = svgRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * W;
    let i = Math.round((mx - pad.l) / (iw / (n - 1 || 1)));
    i = Math.max(0, Math.min(n - 1, i));
    setHover({ i, sx: rect.width / W, sy: rect.height / H });
  }

  return (
    <div className="chart-wrap">
      <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} width="100%" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
        {gridlines}
        <path d={area} fill="var(--series-1-soft)" />
        <path d={line} fill="none" stroke="var(--series-1)" strokeWidth="2" strokeLinejoin="round" />
        <line className="baseline" x1={pad.l} y1={Y(0)} x2={W - pad.r} y2={Y(0)} />
        {labels.map((L, i) =>
          (i % 2 === 0 || i === n - 1) ? (
            <text key={i} className="axislbl" x={X(i)} y={H - 8} textAnchor="middle">{L}</text>
          ) : null
        )}
        {values.map((v, i) => (
          <circle key={i} cx={X(i)} cy={Y(v)} r="3" fill="var(--series-1)" stroke="var(--surface-chart)" strokeWidth="1.5" />
        ))}
        {hover && <line x1={X(hover.i)} y1={pad.t} x2={X(hover.i)} y2={pad.t + ih} stroke="var(--series-1)" strokeWidth="1" />}
        <rect x={pad.l} y={pad.t} width={iw} height={ih} fill="transparent"
          onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
      </svg>
      {hover && (
        <div className="tip" style={{ opacity: 1, left: X(hover.i) * hover.sx, top: Y(values[hover.i]) * hover.sy }}>
          {format(values[hover.i])}<span className="tip-sub">{labels[hover.i]}</span>
        </div>
      )}
    </div>
  );
}
