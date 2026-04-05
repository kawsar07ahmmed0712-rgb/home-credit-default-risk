import { Link } from "react-router-dom";

export default function RelatedColumnsPanel({ items }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex flex-wrap items-start justify-between gap-3 rounded-[1.3rem] border border-white/10 bg-slate-950/60 px-4 py-4"
        >
          <div>
            <p className="text-sm font-semibold text-white">{item.name}</p>
            <p className="mt-1 text-sm text-slate-400">{item.family}</p>
            {item.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{item.description}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            {item.missing_pct !== undefined ? (
              <span className="data-pill">{Number(item.missing_pct).toFixed(2)}% missing</span>
            ) : null}
            <Link
              to={`/visualization-studio?x=${encodeURIComponent(item.name)}`}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white"
            >
              Visualize
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
