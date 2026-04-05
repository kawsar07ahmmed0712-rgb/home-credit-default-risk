const labels = {
  missing_handling: "Missing handling",
  transformation: "Transformation",
  encoding: "Encoding",
  feature_engineering: "Feature engineering",
  decision: "Drop / keep / review",
};

export default function AuditRecommendations({ recommendations }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {Object.entries(recommendations).map(([key, value]) => (
        <div key={key} className="rounded-[1.4rem] border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
            {labels[key] ?? key}
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">{value}</p>
        </div>
      ))}
    </div>
  );
}
