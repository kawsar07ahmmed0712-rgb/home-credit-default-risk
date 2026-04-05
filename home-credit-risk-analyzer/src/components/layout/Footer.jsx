import { Link } from "react-router-dom";
import { aboutProfile, appMeta, navItems } from "../../data/siteData";

export default function Footer() {
  const primaryLinks = navItems.slice(1, 6);
  const secondaryLinks = navItems.slice(6);

  return (
    <footer className="mt-20 border-t border-white/10 bg-slate-950/70">
      <div className="page-shell grid gap-10 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <h3 className="text-lg font-semibold text-white">{appMeta.title}</h3>
          <p className="mt-3 max-w-sm text-sm leading-7 text-slate-400">
            {appMeta.description}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Core Pages
          </h4>
          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400">
            {primaryLinks.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Supporting Pages
          </h4>
          <div className="mt-4 flex flex-col gap-2 text-sm text-slate-400">
            {secondaryLinks.map((item) => (
              <Link key={item.to} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">
            Contact
          </h4>
          <div className="mt-4 space-y-2 text-sm text-slate-400">
            <p>{aboutProfile.name}</p>
            <a href={`mailto:${aboutProfile.email}`} className="transition hover:text-white">
              {aboutProfile.email}
            </a>
            <a href={aboutProfile.github} className="transition hover:text-white">
              GitHub
            </a>
            <a href={aboutProfile.linkedin} className="transition hover:text-white">
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
