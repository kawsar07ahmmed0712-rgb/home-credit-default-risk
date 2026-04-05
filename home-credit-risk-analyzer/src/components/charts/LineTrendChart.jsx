import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

export default function LineTrendChart({
  data,
  xKey,
  yKey,
  title,
  subtitle,
  yFormatter,
  yDomain,
  series,
}) {
  const resolvedSeries = series ?? [{ key: yKey, color: "#22d3ee", label: title }];

  return (
    <div className="soft-card p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle ? <p className="mt-3 text-sm leading-7 text-slate-400">{subtitle}</p> : null}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey={xKey} stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis
              domain={yDomain ?? ["dataMin - 0.001", "dataMax + 0.001"]}
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              tickFormatter={yFormatter}
            />
            <Tooltip
              formatter={(value) => (yFormatter ? yFormatter(value) : value)}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#fff",
              }}
            />
            {resolvedSeries.length > 1 ? (
              <Legend wrapperStyle={{ color: "#cbd5e1", fontSize: "12px" }} />
            ) : null}
            {resolvedSeries.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={3}
                dot={{ r: 4, fill: line.color }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
