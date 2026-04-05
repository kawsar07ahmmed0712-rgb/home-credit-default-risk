export default function RawReportGrid({ report }) {
  const entries = Object.entries(report);

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {entries.map(([key, value]) => (
        <div key={key} className="rounded-[1.1rem] border border-white/10 bg-slate-950/60 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{key}</p>
          <p className="mt-2 break-words text-sm text-slate-200">{String(value)}</p>
        </div>
      ))}
    </div>
  );
}
