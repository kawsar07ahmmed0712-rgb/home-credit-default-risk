export default function InsightList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li
          key={item}
          className="flex gap-4 rounded-[1.4rem] border border-white/10 bg-slate-950/60 px-4 py-4 text-sm leading-7 text-slate-300"
        >
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-xs font-semibold text-cyan-300">
            {index + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
