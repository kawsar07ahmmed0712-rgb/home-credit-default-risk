import PageHero from "../components/common/PageHero";
import PageShell from "../components/common/PageShell";
import SectionHeading from "../components/common/SectionHeading";
import { methodologySections } from "../data/siteData";

export default function MethodologyPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Methodology"
        title="How the workflow works from data consolidation to manual exploration"
        description="This page explains the analytical sequence behind the studio and gives a practical guide for how someone should use the audit explorer and visualization tools."
      />

      <section className="mt-16">
        <SectionHeading
          eyebrow="How It Works"
          title="The product mirrors the actual workflow"
          subtitle="The methodology is kept visible so a reviewer can see how the work was structured from start to finish."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {methodologySections.map((section, index) => (
            <div key={section.title} className="soft-card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                Stage {index + 1}
              </p>
              <h3 className="mt-3 text-xl font-semibold text-white">{section.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{section.text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
