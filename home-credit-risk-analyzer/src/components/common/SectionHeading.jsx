export default function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-8 max-w-3xl">
      {eyebrow && (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
          {eyebrow}
        </p>
      )}
      <h2 className="section-title">{title}</h2>
      {subtitle ? <p className="section-subtitle mt-3">{subtitle}</p> : null}
    </div>
  );
}
