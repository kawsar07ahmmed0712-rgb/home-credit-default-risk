import { motion as Motion } from "motion/react";

export default function MetricCard({ label, value, hint, icon: Icon }) {
  return (
    <Motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="gradient-border p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="metric-label">{label}</p>
          <p className="metric-value mt-3">{value}</p>
        </div>
        {Icon ? (
          <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300 ring-1 ring-cyan-400/20">
            <Icon size={20} />
          </div>
        ) : null}
      </div>

      {hint ? <p className="text-sm leading-6 text-slate-400">{hint}</p> : null}
    </Motion.div>
  );
}
