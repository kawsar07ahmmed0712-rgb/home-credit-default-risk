export default function EmptyState({ title, message }) {
  return (
    <div className="soft-card p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-400">{message}</p>
    </div>
  );
}
