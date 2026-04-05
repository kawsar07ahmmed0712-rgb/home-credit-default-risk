import PageShell from "../components/common/PageShell";
import PageHero from "../components/common/PageHero";
import SectionHeading from "../components/common/SectionHeading";
import {
  aboutLearnings,
  aboutProfile,
  futurePredictionNotes,
} from "../data/siteData";

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="About"
        title="A polished case-study product built to show structured ML thinking, not just a final score"
        description={aboutProfile.summary}
      />

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass-card p-6">
          <SectionHeading
            eyebrow="Profile"
            title={aboutProfile.name}
            subtitle={aboutProfile.role}
          />
          <div className="space-y-5 text-sm leading-7 text-slate-300">
            <p>
              This project was built to make a complex Home Credit workflow inspectable. Instead of
              stopping at notebooks and metrics, I turned the work into an audit-first web product
              that explains how the data was consolidated, how columns were evaluated, why
              selective EDA was used, and how the final model was shaped.
            </p>
            <p>
              The result is meant for recruiters, hiring managers, ML engineers, analysts, and
              clients who want to see both technical execution and product thinking in the same
              project.
            </p>
          </div>
        </div>

        <div className="soft-card p-6">
          <SectionHeading
            eyebrow="Learnings"
            title="What this project taught me"
            subtitle="These are the principles I want future ML projects to communicate more clearly."
          />
          <ul className="space-y-4 text-sm leading-7 text-slate-300">
            {aboutLearnings.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="soft-card p-6">
          <SectionHeading
            eyebrow="Why This Tool Exists"
            title="A machine-learning project becomes more valuable when people can actually inspect the reasoning"
            subtitle="The studio was designed to make the audit usable, the EDA intentional, and the modeling workflow defensible."
          />
          <ul className="space-y-4 text-sm leading-7 text-slate-300">
            {futurePredictionNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
          <ContactCard
            label="Email"
            value={aboutProfile.email}
            href={`mailto:${aboutProfile.email}`}
          />
          <ContactCard label="GitHub" value={aboutProfile.github} href={aboutProfile.github} />
          <ContactCard
            label="LinkedIn"
            value={aboutProfile.linkedin}
            href={aboutProfile.linkedin}
          />
        </div>
      </section>
    </PageShell>
  );
}

function ContactCard({ label, value, href }) {
  return (
    <div className="gradient-border p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">{label}</p>
      <a
        href={href}
        className="mt-4 block break-all text-sm text-slate-200 transition hover:text-white"
      >
        {value}
      </a>
    </div>
  );
}
