import { Combine, ScanSearch, Scale, Wrench } from "lucide-react";

import PageShell from "../components/common/PageShell";
import PageHero from "../components/common/PageHero";
import SectionHeading from "../components/common/SectionHeading";
import MetricCard from "../components/common/MetricCard";
import {
  engineeredFeatureGroups,
  engineeringBeforeAfter,
  engineeringMetricCards,
  engineeringSteps,
} from "../data/siteData";

const metricIcons = [ScanSearch, Wrench, Scale, Combine];
const stepIcons = [ScanSearch, Wrench, Scale, Combine, Wrench];

export default function FeatureEngineeringPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Feature Engineering"
        title="Feature engineering turned a good structural understanding into a trainable matrix"
        description="This stage connected the structural report to concrete modeling inputs: report-driven drop logic, family-specific missingness rules, ratio construction, and safer train/test alignment."
      />

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {engineeringMetricCards.map((metric, index) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
            icon={metricIcons[index]}
          />
        ))}
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Engineering Decisions"
          title="The notebook used report-backed rules instead of scattered manual edits"
          subtitle="These are the main engineering moves that transformed the consolidated report into the final 874-feature model matrix."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {engineeringSteps.map((step, index) => {
            const Icon = stepIcons[index];

            return (
              <div key={step.title} className="soft-card p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                  {Icon ? (
                    <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-300">
                      <Icon size={20} />
                    </div>
                  ) : null}
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-400">{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Key Feature Groups"
          title="A few engineered families did most of the real work"
          subtitle="The examples below show how the notebook moved from raw fields to grouped, more model-friendly signals."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {engineeredFeatureGroups.map((group) => (
            <div key={group.name} className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white">{group.name}</h3>
              <p className="mt-4 text-sm font-medium text-cyan-300">{group.examples}</p>
              <p className="mt-4 text-sm leading-7 text-slate-400">{group.reason}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <Block
          title="Before engineering"
          items={engineeringBeforeAfter.before}
          variant="glass-card"
        />
        <Block
          title="After engineering"
          items={engineeringBeforeAfter.after}
          variant="soft-card"
        />
      </section>
    </PageShell>
  );
}

function Block({ title, items, variant }) {
  return (
    <div className={`${variant} p-6`}>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
