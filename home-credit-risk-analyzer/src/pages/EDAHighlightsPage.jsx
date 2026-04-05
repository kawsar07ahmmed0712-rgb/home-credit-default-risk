import BarComparisonChart from "../components/charts/BarComparisonChart";
import DonutChartCard from "../components/charts/DonutChartCard";
import InsightList from "../components/common/InsightList";
import MetricCard from "../components/common/MetricCard";
import PageHero from "../components/common/PageHero";
import PageShell from "../components/common/PageShell";
import SectionHeading from "../components/common/SectionHeading";
import { curatedEdaSections, edaHighlights } from "../data/siteData";

const targetDistribution = [
  { name: "Non-default", value: 91.93 },
  { name: "Default", value: 8.07 },
];

const topSignals = [
  { name: "APP_EXT_SOURCE_MEAN", value: -0.2221 },
  { name: "APP_EXT_SOURCE_MAX", value: -0.1969 },
  { name: "APP_EXT_SOURCE_MIN", value: -0.1853 },
  { name: "EXT_SOURCE_3", value: -0.1789 },
  { name: "EXT_SOURCE_2", value: -0.1605 },
  { name: "CC_BALANCE_LIMIT_RATIO_MEAN", value: 0.1356 },
];

const metricCards = [
  {
    label: "Default Rate",
    value: "8.07%",
    hint: "The class imbalance is why target-aware visuals and ROC-AUC matter throughout the project.",
  },
  {
    label: "Strongest Correlation",
    value: "-0.2221",
    hint: "APP_EXT_SOURCE_MEAN was the strongest target-linked numerical signal in the saved report.",
  },
  {
    label: "EDA Strategy",
    value: "Selective",
    hint: "The project deliberately favored shortlist-driven EDA over exhaustive dashboarding.",
  },
  {
    label: "Target-Aware Views",
    value: "High Value",
    hint: "Categorical signals become much clearer when shown beside target-rate context.",
  },
];

export default function EDAHighlightsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="EDA Highlights"
        title="Curated EDA was chosen because intentional charts teach more than volume"
        description="This section highlights the most meaningful patterns from the selective EDA stage: target distribution, high-signal numerical features, category-driven views, and the reasoning behind the shortlist approach."
      />

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
          />
        ))}
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <DonutChartCard
          title="Target Distribution"
          subtitle="The minority default class is why the app repeatedly emphasizes target-rate views and ranking metrics instead of simplistic accuracy narratives."
          data={targetDistribution}
          valueFormatter={(value) => `${Number(value).toFixed(2)}%`}
        />
        <BarComparisonChart
          title="Target-Linked Numerical Signals"
          subtitle="A small set of signals dominates the early analytical story, which is exactly why selective EDA was a strategic choice."
          data={topSignals}
          xKey="name"
          yKey="value"
          layout="vertical"
          valueFormatter={(value) => Number(value).toFixed(4)}
          heightClass="h-[25rem]"
        />
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Narrative Flow"
          title="The EDA section stays strong by choosing questions deliberately"
          subtitle="Each block below exists because it improved understanding, not because the dataset happened to have another column available."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {curatedEdaSections.map((item) => (
            <div key={item.title} className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Key Takeaways"
          title="What the selective EDA revealed"
          subtitle="These are the high-signal conclusions that shaped later feature engineering and model interpretation."
        />
        <InsightList items={edaHighlights.map((item) => `${item.title}: ${item.text}`)} />
      </section>
    </PageShell>
  );
}
