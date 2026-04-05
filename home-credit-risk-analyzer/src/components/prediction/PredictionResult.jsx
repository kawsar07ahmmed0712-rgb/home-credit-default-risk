import {
  formatPercent,
  riskColorFromProbability,
  riskLabelFromProbability,
} from "../../utils/formatters";

export default function PredictionResult({ result }) {
  if (!result) {
    return (
      <div className="soft-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
          Prediction Result
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-white">Awaiting scenario</h3>
        <p className="mt-3 text-sm leading-7 text-slate-400">
          Submit the form to run the normalized prediction flow. If no backend is configured, the
          app will use the frontend demo engine and still return the same shape used by the result
          panel.
        </p>
      </div>
    );
  }

  const barColor = riskColorFromProbability(result.probability);
  const title = result.label ?? riskLabelFromProbability(result.probability);

  return (
    <div className="soft-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Prediction Result
          </p>
          <h3 className="mt-3 text-3xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-400">
            Probability of default: {formatPercent(result.probability, 1)}
          </p>
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/80 px-5 py-4 text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Source</p>
          <p className="mt-2 text-sm font-medium text-white">{result.source}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-400">
          <span>Risk score</span>
          <span>{formatPercent(result.probability, 1)}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full ${barColor} transition-all`}
            style={{ width: `${result.probability * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {(result.drivers ?? []).map((driver) => (
          <div
            key={driver.label}
            className="rounded-[1.4rem] border border-white/10 bg-slate-950/70 px-4 py-4"
          >
            <p className="text-sm text-slate-300">{driver.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{driver.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 rounded-[1.4rem] border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm leading-7 text-amber-100">
        This UI stays frontend-only for now. When a backend `/predict` endpoint is connected, the
        card keeps the same shape and simply changes the `source` field from demo to API.
      </p>
    </div>
  );
}
