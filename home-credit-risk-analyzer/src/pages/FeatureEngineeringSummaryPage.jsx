import MetricCard from "../components/common/MetricCard";
import PageHero from "../components/common/PageHero";
import PageShell from "../components/common/PageShell";
import SectionHeading from "../components/common/SectionHeading";
import { featureEngineeringSections, modelMetrics } from "../data/siteData";

const summaryCards = [
  {
    label: "Original Consolidated Columns",
    value: "584",
    hint: "Starting point for the structural audit and selective EDA workflow.",
  },
  {
    label: "Final Trainable Features",
    value: String(modelMetrics.trainingFeatures),
    hint: "Final model feature count after logic-driven engineering and alignment.",
  },
  {
    label: "Categorical Features",
    value: String(modelMetrics.categoricalFeatures),
    hint: "Handled with train/test-consistent logic.",
  },
  {
    label: "Numeric Features",
    value: String(modelMetrics.numericFeatures),
    hint: "Prepared for a GPU-ready model training pipeline.",
  },
];

const beforeAfter = {
  before: [
    "Mixed feature families with different missingness meaning",
    "Skewed amount features and repeated structural groups",
    "Need for grouped reasoning across history, housing, and inquiry features",
    "Risk of inconsistent train/test handling if engineering stayed ad hoc",
  ],
  after: [
    "A cleaner trainable matrix with aligned columns and explicit feature roles",
    "Grouped engineering logic for families instead of one-off isolated transforms",
    "Safer handling of structural missingness versus true missingness",
    "A stable 874-feature matrix ready for model training",
  ],
};

export default function FeatureEngineeringSummaryPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Feature Engineering Summary"
        title="Feature engineering was important because the project needed logic, not random feature creation"
        description="This page shows how structural audit and selective EDA influenced missing handling, transformations, encoding, group-based logic, and final train/test alignment decisions."
      />

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
          />
        ))}
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Major Decisions"
          title="Feature engineering was driven by audit evidence and selected EDA findings"
          subtitle="The strongest signal in this section should be structured thinking, not feature-count inflation."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {featureEngineeringSections.map((section) => (
            <div key={section.title} className="soft-card p-6">
              <h3 className="text-xl font-semibold text-white">{section.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{section.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <SectionHeading
            eyebrow="Before"
            title="What the project had to deal with first"
            subtitle="These were the structural issues that made feature engineering necessary rather than optional."
          />
          <ul className="space-y-4 text-sm leading-7 text-slate-300">
            {beforeAfter.before.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="soft-card p-6">
          <SectionHeading
            eyebrow="After"
            title="What the final engineering stage delivered"
            subtitle="The goal was a safer, more defensible matrix, not just a larger one."
          />
          <ul className="space-y-4 text-sm leading-7 text-slate-300">
            {beforeAfter.after.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
