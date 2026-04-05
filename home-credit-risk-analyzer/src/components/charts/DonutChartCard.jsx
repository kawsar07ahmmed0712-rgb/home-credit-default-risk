import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const COLORS = ["#22d3ee", "#6366f1", "#0ea5e9", "#f59e0b", "#10b981"];

export default function DonutChartCard({ data, title, subtitle, valueFormatter }) {
  return (
    <div className="soft-card p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {subtitle ? <p className="mt-3 text-sm leading-7 text-slate-400">{subtitle}</p> : null}
      <div className="grid items-center gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => (valueFormatter ? valueFormatter(value) : value)}
                contentStyle={{
                  background: "#0f172a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "16px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-slate-300">{item.name}</span>
              </div>
              <span className="text-sm font-semibold text-white">
                {valueFormatter ? valueFormatter(item.value) : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
