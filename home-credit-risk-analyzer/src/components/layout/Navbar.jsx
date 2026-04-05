import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X, BarChart3 } from "lucide-react";
import { appMeta, navItems } from "../../data/siteData";

function getNavClass({ isActive }) {
  return isActive ? "nav-link nav-link-active" : "nav-link";
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl">
      <div className="page-shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-cyan-400/10 p-2 text-cyan-300 ring-1 ring-cyan-400/20">
            <BarChart3 size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{appMeta.title}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Structural audit and visualization workbench
            </p>
          </div>
        </NavLink>

        <nav className="hidden max-w-5xl flex-wrap items-center justify-end gap-2 xl:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={getNavClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="page-shell pb-4 xl:hidden">
          <div className="glass-card flex flex-col gap-2 p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={getNavClass}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
