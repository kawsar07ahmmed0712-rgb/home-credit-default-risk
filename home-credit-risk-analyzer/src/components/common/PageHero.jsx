import { motion as Motion } from "motion/react";

export default function PageHero({ eyebrow, title, description, children }) {
  return (
    <section className="hero-panel relative overflow-hidden px-6 py-12 sm:px-10 sm:py-16">
      <div className="hero-orb left-0 top-0 h-44 w-44 bg-cyan-500/30" />
      <div className="hero-orb bottom-0 right-0 h-44 w-44 bg-amber-400/20" />
      <div className="hero-grid" />

      <Motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 max-w-5xl"
      >
        {eyebrow && (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-300">
            {eyebrow}
          </p>
        )}

        <h1 className="max-w-4xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-[3.85rem] lg:leading-[1.02]">
          {title}
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
          {description}
        </p>

        {children ? <div className="mt-8">{children}</div> : null}
      </Motion.div>
    </section>
  );
}
