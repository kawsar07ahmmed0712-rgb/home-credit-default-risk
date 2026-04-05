export default function LoadingState({ title = "Loading", message = "Preparing data..." }) {
  return (
    <div className="soft-card p-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 animate-pulse rounded-full bg-cyan-400/20" />
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-slate-400">{message}</p>
        </div>
      </div>
    </div>
  );
}
