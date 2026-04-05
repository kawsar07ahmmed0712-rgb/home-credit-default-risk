import { Link } from "react-router-dom";
import PageHero from "../components/common/PageHero";
import PageShell from "../components/common/PageShell";
import SectionHeading from "../components/common/SectionHeading";
import {
  futurePredictionNotes,
  modelMetrics,
} from "../data/siteData";

export default function FuturePredictionStudioPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Future Prediction Studio"
        title="Prediction can extend this product later, but it is intentionally not the center of version 1"
        description="The current release prioritizes structural audit, guided visualization, and workflow transparency. Prediction serving can sit on top of the same backend once a production inference API and feature pipeline contract are added."
      />

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card p-6">
          <SectionHeading
            eyebrow="Why It Is Deferred"
            title="This version is audit-first by design"
            subtitle="The strongest portfolio value here is the structured analytical workflow, not a standalone prediction form."
          />
          <ul className="space-y-4 text-sm leading-7 text-slate-300">
            {futurePredictionNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="soft-card p-6">
          <SectionHeading
            eyebrow="What Would Be Needed"
            title="Backend contract for a later prediction layer"
            subtitle="A production-ready prediction studio would need a stricter serving interface than the current exploration APIs."
          />
          <div className="space-y-4 text-sm leading-7 text-slate-300">
            <p>
              The current model was trained with {modelMetrics.trainingFeatures} features across{" "}
              {modelMetrics.categoricalFeatures} categorical and{" "}
              {modelMetrics.numericFeatures} numeric columns. Any future prediction endpoint must
              recreate that training-time feature logic exactly.
            </p>
            <p>
              That means serving should include preprocessing parity, strict schema validation,
              feature derivation, model loading, and safe fallbacks when inputs are incomplete.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        <NextStepCard
          title="Inference API"
          text="Add a dedicated backend endpoint that accepts validated applicant payloads and returns calibrated probability, label, and feature-driver summaries."
        />
        <NextStepCard
          title="Feature Pipeline"
          text="Package the training-time feature engineering logic so the prediction layer and notebooks use the same transformations."
        />
        <NextStepCard
          title="Interpretability"
          text="Add decision explanations, threshold views, and scenario comparisons instead of stopping at a single raw prediction score."
        />
      </section>

      <section className="mt-12 rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
          Recommended Next Action
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Use the current product the way it was designed
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Start with the dataset overview, inspect a feature in the audit explorer, then move into
          the visualization studio with a specific question. That workflow shows the real maturity
          of the project more clearly than a prediction form would.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/column-audit-explorer"
            className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950"
          >
            Explore Column Audit
          </Link>
          <Link
            to="/visualization-studio"
            className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold text-white"
          >
            Open Visualization Studio
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

function NextStepCard({ title, text }) {
  return (
    <div className="gradient-border p-6">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-300">{text}</p>
    </div>
  );
}
