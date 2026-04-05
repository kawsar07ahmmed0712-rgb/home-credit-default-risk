export default function AuditFlagList({ flags }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {flags.map((flag) => (
        <div
          key={flag.label}
          className={`rounded-[1.2rem] border px-4 py-3 text-sm ${
            flag.active
              ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
              : "border-white/10 bg-white/[0.03] text-slate-300"
          }`}
        >
          <p className="font-semibold">{flag.label}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.18em] opacity-80">
            {flag.active ? "Active" : "Not Triggered"}
          </p>
        </div>
      ))}
    </div>
  );
}
