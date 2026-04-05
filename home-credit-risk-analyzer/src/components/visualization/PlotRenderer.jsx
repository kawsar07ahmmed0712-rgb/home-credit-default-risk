import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function CardFrame({ title, children }) {
  return (
    <div className="soft-card p-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export default function PlotRenderer({ plot }) {
  if (!plot) return null;

  switch (plot.kind) {
    case "histogram":
      return <HistogramCard plot={plot} />;
    case "stacked-histogram":
      return <StackedHistogramCard plot={plot} />;
    case "density-line":
      return <DensityLineCard plot={plot} />;
    case "violin":
      return <DensityLineCard plot={plot} titleSuffix="(violin-style density)" />;
    case "scatter":
      return <ScatterCard plot={plot} />;
    case "stacked-bar":
      return <StackedBarCard plot={plot} />;
    case "target-rate-bar":
      return <TargetRateCard plot={plot} />;
    case "box-summary":
      return <BoxSummaryCard plot={plot} />;
    case "box-summary-group":
    case "grouped-summary":
      return <GroupedSummaryCard plot={plot} />;
    case "bar":
    default:
      return <SimpleBarCard plot={plot} />;
  }
}

function HistogramCard({ plot }) {
  return (
    <CardFrame title={plot.title}>
      <div className="h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={plot.chart_data}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} hide />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#22d3ee" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardFrame>
  );
}

function StackedHistogramCard({ plot }) {
  return (
    <CardFrame title={plot.title}>
      <div className="h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={plot.chart_data}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} hide />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="non_default" stackId="risk" fill="#22d3ee" radius={[0, 0, 0, 0]} />
            <Bar dataKey="default" stackId="risk" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardFrame>
  );
}

function DensityLineCard({ plot, titleSuffix = "" }) {
  return (
    <CardFrame title={`${plot.title} ${titleSuffix}`.trim()}>
      <div className="h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={plot.chart_data}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="x" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="density" stroke="#22d3ee" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardFrame>
  );
}

function ScatterCard({ plot }) {
  return (
    <CardFrame title={plot.title}>
      <div className="h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid stroke="#1e293b" />
            <XAxis type="number" dataKey="x" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis type="number" dataKey="y" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip cursor={{ strokeDasharray: "3 3" }} />
            <Scatter data={plot.chart_data.points} fill="#22d3ee" />
            {plot.chart_data.regression ? (
              <Line
                data={plot.chart_data.regression}
                type="monotone"
                dataKey="y"
                stroke="#f59e0b"
                dot={false}
              />
            ) : null}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </CardFrame>
  );
}

function StackedBarCard({ plot }) {
  const seriesKeys = plot.chart_data.series_keys ?? [];

  return (
    <CardFrame title={plot.title}>
      <div className="h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={plot.chart_data.rows}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="category" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip />
            {seriesKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId="stack"
                fill={STACKED_COLORS[index % STACKED_COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardFrame>
  );
}

function TargetRateCard({ plot }) {
  return (
    <CardFrame title={plot.title}>
      <div className="h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={plot.chart_data}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis dataKey="category" stroke="#94a3b8" tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar dataKey="target_rate" fill="#f59e0b" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardFrame>
  );
}

function SimpleBarCard({ plot }) {
  return (
    <CardFrame title={plot.title}>
      <div className="h-[24rem]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={plot.chart_data}>
            <CartesianGrid stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey={plot.chart_data[0]?.category ? "category" : "label"}
              stroke="#94a3b8"
              tickLine={false}
              axisLine={false}
            />
            <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
            <Tooltip />
            <Bar
              dataKey={plot.chart_data[0]?.count !== undefined ? "count" : "share"}
              fill="#22d3ee"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardFrame>
  );
}

function BoxSummaryCard({ plot }) {
  const stats = plot.chart_data;
  const min = stats.min ?? 0;
  const max = stats.max ?? 0;
  const range = max - min || 1;
  const position = (value) => `${((value - min) / range) * 100}%`;

  return (
    <CardFrame title={plot.title}>
      <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-6">
        <div className="relative h-16">
          <div className="absolute top-7 h-1 w-full rounded-full bg-white/10" />
          <div
            className="absolute top-4 h-7 rounded-[0.9rem] border border-cyan-400/30 bg-cyan-400/15"
            style={{
              left: position(stats.q1),
              width: `calc(${position(stats.q3)} - ${position(stats.q1)})`,
            }}
          />
          <div
            className="absolute top-2 h-11 w-[2px] bg-white"
            style={{ left: position(stats.median) }}
          />
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            ["Min", stats.min],
            ["Q1", stats.q1],
            ["Median", stats.median],
            ["Q3", stats.q3],
            ["Max", stats.max],
            ["Mean", stats.mean],
          ].map(([label, value]) => (
            <div key={label} className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
              <p className="mt-2 text-sm font-semibold text-white">{Number(value).toFixed(4)}</p>
            </div>
          ))}
        </div>
      </div>
    </CardFrame>
  );
}

function GroupedSummaryCard({ plot }) {
  return (
    <CardFrame title={plot.title}>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {plot.chart_data.map((item) => (
          <div key={item.category} className="rounded-[1.2rem] border border-white/10 bg-slate-950/70 p-4">
            <p className="text-sm font-semibold text-white">{item.category}</p>
            {Object.entries(item)
              .filter(([key]) => key !== "category")
              .map(([key, value]) => (
                <div key={key} className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <span className="text-slate-400">{key}</span>
                  <span className="text-slate-200">{Number(value).toFixed(4)}</span>
                </div>
              ))}
          </div>
        ))}
      </div>
    </CardFrame>
  );
}

const STACKED_COLORS = ["#22d3ee", "#0ea5e9", "#6366f1", "#f59e0b", "#10b981", "#f97316"];
