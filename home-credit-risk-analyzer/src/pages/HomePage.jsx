import { Link } from "react-router-dom";
import { ArrowRight, BarChart3, Database, SearchCheck, Sparkles } from "lucide-react";

import MetricCard from "../components/common/MetricCard";
import PageHero from "../components/common/PageHero";
import PageShell from "../components/common/PageShell";
import SectionHeading from "../components/common/SectionHeading";
import {
  appMeta,
  homeMetrics,
  homePreviewCards,
  structuralAuditCentralPoints,
  workflowSteps,
} from "../data/siteData";

const icons = [BarChart3, Database, SearchCheck, Sparkles];

export default function HomePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Home Credit Project Product"
        title={appMeta.title}
        description={appMeta.description}
      >
        <div className="flex flex-wrap gap-4">
          <Link
            to="/column-audit-explorer"
            className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Explore Column Audit
          </Link>
          <Link
            to="/visualization-studio"
            className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Open Visualization Studio
          </Link>
        </div>
      </PageHero>

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {homeMetrics.map((metric, index) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            icon={icons[index]}
          />
        ))}
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Workflow"
          title="The product is organized around the real ML workflow, not around a generic dashboard shell"
          subtitle="Structural audit sits in the middle of the site because it was the backbone of the full project and the reason later EDA and engineering stayed disciplined."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <div key={step} className="soft-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Step {index + 1}
              </p>
              <h3 className="mt-3 text-lg font-semibold text-white">{step}</h3>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="gradient-border p-6">
          <SectionHeading
            eyebrow="Why Audit Came First"
            title="Structural audit was central because the dataset was too wide for blind brute-force visualization"
            subtitle="The app keeps that logic visible: inspect structure first, then move into manual visualization and curated storytelling."
          />
          <ul className="space-y-4 text-sm leading-7 text-slate-300">
            {structuralAuditCentralPoints.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="soft-card p-6">
          <SectionHeading
            eyebrow="Positioning"
            title="This is a project website and analysis workbench"
            subtitle="The goal is to make the audit and visualization actually usable for reviewers, analysts, and recruiters."
          />
          <div className="space-y-3 text-sm leading-7 text-slate-300">
            <p>Not a prediction-first demo.</p>
            <p>Not a cluttered admin dashboard.</p>
            <p>Not a static landing page.</p>
            <p>A structured ML product experience with manual exploration built in.</p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Preview"
          title="Start from the product surfaces that matter most"
          subtitle="These three areas define version 1 of the studio: column audit, manual visualization, and the model-performance story that closes the loop."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {homePreviewCards.map((card) => (
            <Link
              key={card.to}
              to={card.to}
              className="glass-card flex h-full flex-col justify-between p-6 transition hover:-translate-y-1"
            >
              <div>
                <h3 className="text-xl font-semibold text-white">{card.title}</h3>
                <p className="mt-4 text-sm leading-7 text-slate-400">{card.text}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">
                Open page
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
