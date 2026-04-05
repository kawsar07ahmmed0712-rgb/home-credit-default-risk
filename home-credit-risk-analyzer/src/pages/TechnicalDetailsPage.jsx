import PageShell from "../components/common/PageShell";
import PageHero from "../components/common/PageHero";
import SectionHeading from "../components/common/SectionHeading";
import DataTableCard from "../components/common/DataTableCard";
import {
  artifactSources,
  sourceTree,
  technicalArchitecture,
  technicalStack,
} from "../data/siteData";

export default function TechnicalDetailsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Technical Details"
        title="The frontend is now organized around artifact-backed content instead of placeholder storytelling"
        description="This page explains the main technical choices in the React app, where the current numbers come from, and how the prediction layer can later attach to a backend service."
      />

      <section className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {technicalStack.map((item) => (
          <div key={item} className="soft-card p-5 text-sm font-medium text-slate-200">
            {item}
          </div>
        ))}
      </section>

      <section className="mt-16 grid gap-6 xl:grid-cols-3">
        {technicalArchitecture.map((block) => (
          <div key={block.title} className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white">{block.title}</h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <DataTableCard
          title="Current Artifact Sources"
          subtitle="These files are the source of truth for the values displayed throughout the app."
          columns={[
            { key: "label", label: "Artifact" },
            { key: "path", label: "Path" },
            { key: "note", label: "Usage" },
          ]}
          rows={artifactSources}
        />

        <div className="soft-card p-6">
          <SectionHeading
            eyebrow="Source Layout"
            title="High-level project structure"
            subtitle="The frontend is organized around data, pages, shared components, and a small prediction service boundary."
          />
          <pre className="overflow-x-auto rounded-[1.5rem] border border-white/10 bg-slate-950/70 p-5 text-sm text-slate-200">
            {sourceTree}
          </pre>
        </div>
      </section>
    </PageShell>
  );
}
