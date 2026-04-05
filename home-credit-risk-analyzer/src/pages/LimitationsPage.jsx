import PageShell from "../components/common/PageShell";
import PageHero from "../components/common/PageHero";
import SectionHeading from "../components/common/SectionHeading";
import { limitationCallouts, limitationGroups } from "../data/siteData";

export default function LimitationsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Limitations"
        title="The redesign is stronger, but it is still honest about what this project is and is not"
        description="This page makes the scope explicit so the app reads like a disciplined case study instead of an overclaimed product demo."
      />

      <section className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {limitationCallouts.map((item) => (
          <div key={item} className="gradient-border p-5 text-sm font-medium text-slate-200">
            {item}
          </div>
        ))}
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Scope Notes"
          title="The main boundaries of the current implementation"
          subtitle="These limits are not hidden because they are part of what makes the project credible."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {limitationGroups.map((item) => (
            <div key={item.title} className="soft-card p-6">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
