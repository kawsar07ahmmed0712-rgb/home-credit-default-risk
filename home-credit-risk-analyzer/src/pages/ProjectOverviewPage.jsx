import PageShell from "../components/common/PageShell";
import PageHero from "../components/common/PageHero";
import SectionHeading from "../components/common/SectionHeading";
import {
  datasetChallenges,
  notebookTrail,
  projectDeliverables,
  projectOverviewCards,
  workflowPhases,
} from "../data/siteData";

export default function ProjectOverviewPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Project Overview"
        title="A structured credit-risk case study built from messy relational data and saved modeling artifacts"
        description="This page explains the project context, why the dataset needed discipline before visualization, and how the workflow was organized from raw tables to a portfolio-ready frontend."
      />

      <section className="mt-14 grid gap-6 lg:grid-cols-3">
        {projectOverviewCards.map((card) => (
          <InfoCard key={card.title} title={card.title} text={card.text} />
        ))}
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Project Sequence"
          title="The workflow was designed to reduce ambiguity before spending modeling effort"
          subtitle="This sequence mirrors the notebook order and the logic behind the redesign."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {workflowPhases.map((phase) => (
            <div key={phase.step} className="soft-card p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Stage {phase.step}
              </p>
              <h3 className="mt-4 text-lg font-semibold text-white">{phase.title}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">{phase.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-6">
          <SectionHeading
            eyebrow="Dataset Challenges"
            title="Why a brute-force workflow would have been weak"
            subtitle="The project needed structure before intuition because the raw problem space was too wide to treat casually."
          />
          <ul className="space-y-4 text-sm leading-7 text-slate-300">
            {datasetChallenges.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="soft-card p-6">
          <SectionHeading
            eyebrow="Deliverables"
            title="What the project ultimately produced"
            subtitle="The value is the full workflow evidence, not only the final ROC-AUC number."
          />
          <ul className="space-y-4 text-sm leading-7 text-slate-300">
            {projectDeliverables.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Notebook Backbone"
          title="The narrative follows the actual artifacts"
          subtitle="These notebook files and outputs are the backbone of the frontend, which keeps the case study grounded."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {notebookTrail.map((notebook) => (
            <div key={notebook.title} className="gradient-border p-6">
              <h3 className="text-xl font-semibold text-white">{notebook.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{notebook.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

function InfoCard({ title, text }) {
  return (
    <div className="gradient-border p-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-slate-400">{text}</p>
    </div>
  );
}
