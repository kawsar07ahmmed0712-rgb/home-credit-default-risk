export default function ErrorState({ title = "Something went wrong", message, onRetry }) {
  return (
    <div className="rounded-[1.7rem] border border-rose-500/20 bg-rose-500/10 p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-rose-100/90">
        {message ?? "The request could not be completed."}
      </p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
