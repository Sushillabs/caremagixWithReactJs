// Weight-over-time line chart. Single series (weight) so no legend box is
// needed — the card title already names it. Each point is colored by its
// check-in zone (status, not identity), using the same green/amber/red
// mapping as the zone banner; validated colorblind-safe as a set via
// dataviz's validate_palette.js. Never color-alone: every point carries a
// native <title> tooltip spelling out date/weight/zone as text.
const ZONE_FILL = {
  green: "fill-emerald-600",
  yellow: "fill-amber-500",
  red: "fill-red-600",
  unknown: "fill-gray-400",
};

const WIDTH = 640;
const HEIGHT = 160;
const PAD = { top: 12, right: 12, bottom: 24, left: 32 };

export default function WeightTrendChart({ series = [] }) {
  if (series.length === 0) {
    return <p className="p-4 text-center text-xs text-gray-400">Weigh yourself each morning and your trend will appear here.</p>;
  }
  if (series.length === 1) {
    return (
      <p className="p-4 text-center text-xs text-gray-400">
        One weight recorded so far ({series[0].weight_lb} lb). Check in again tomorrow to see the trend.
      </p>
    );
  }

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const weights = series.map((p) => p.weight_lb);
  let min = Math.min(...weights);
  let max = Math.max(...weights);
  if (max - min < 4) {
    const mid = (max + min) / 2;
    min = mid - 2;
    max = mid + 2;
  }

  const coords = series.map((point, i) => ({
    x: PAD.left + (plotW * i) / (series.length - 1),
    y: PAD.top + plotH - ((point.weight_lb - min) / (max - min)) * plotH,
    point,
  }));

  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join(" ");
  const labelEvery = Math.max(1, Math.ceil(series.length / 6));

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} width="100%" height={HEIGHT} role="img" aria-label="Weight trend, last 30 days">
      <line x1={PAD.left} y1={PAD.top + plotH} x2={WIDTH - PAD.right} y2={PAD.top + plotH} className="stroke-gray-200" strokeWidth="1" />
      <text x={PAD.left - 4} y={PAD.top + 4} textAnchor="end" className="fill-gray-400 text-[9px]">
        {Math.round(max)}
      </text>
      <text x={PAD.left - 4} y={PAD.top + plotH} textAnchor="end" className="fill-gray-400 text-[9px]">
        {Math.round(min)}
      </text>

      <path d={linePath} fill="none" className="stroke-gray-400" strokeWidth="2" />

      {coords.map((c, i) => (
        <g key={c.point.date}>
          <circle cx={c.x} cy={c.y} r="4" className={`${ZONE_FILL[c.point.zone] || ZONE_FILL.unknown} stroke-white`} strokeWidth="1.5">
            <title>{`${c.point.date} — ${c.point.weight_lb} lb (${c.point.zone} zone)`}</title>
          </circle>
          {i % labelEvery === 0 && (
            <text x={c.x} y={HEIGHT - 6} textAnchor="middle" className="fill-gray-400 text-[9px]">
              {c.point.date.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}
