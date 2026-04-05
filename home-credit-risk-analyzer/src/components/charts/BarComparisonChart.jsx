import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function BarComparisonChart({
  data,
  xKey,
  yKey,
  title,
  subtitle,
  color = "#22d3ee",
  layout = "horizontal",
  valueFormatter,
  labelFormatter,
  heightClass = "h-80",
}) {
  const isVertical = layout === "vertical";

  return (
    <div className="soft-card p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle ? <p className="mt-3 text-sm leading-7 text-slate-400">{subtitle}</p> : null}
      <div className={`mt-5 ${heightClass}`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={isVertical ? "vertical" : "horizontal"}
            margin={isVertical ? { left: 36, top: 8, right: 12, bottom: 8 } : undefined}
          >
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey={isVertical ? undefined : xKey}
              type={isVertical ? "number" : "category"}
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              tickFormatter={isVertical ? valueFormatter : labelFormatter}
            />
            <YAxis
              dataKey={isVertical ? xKey : undefined}
              type={isVertical ? "category" : "number"}
              width={isVertical ? 180 : 40}
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
              tickFormatter={isVertical ? labelFormatter : valueFormatter}
            />
            <Tooltip
              formatter={(value) => (valueFormatter ? valueFormatter(value) : value)}
              labelFormatter={(value) => (labelFormatter ? labelFormatter(value) : value)}
              contentStyle={{
                background: "#0f172a",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#fff",
              }}
            />
            <Bar
              dataKey={yKey}
              fill={color}
              radius={isVertical ? [0, 10, 10, 0] : [10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
