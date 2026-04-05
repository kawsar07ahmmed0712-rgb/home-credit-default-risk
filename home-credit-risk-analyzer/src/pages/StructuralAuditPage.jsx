import {
  AlertTriangle,
  Database,
  FolderTree,
  Layers3,
} from "lucide-react";

import PageShell from "../components/common/PageShell";
import PageHero from "../components/common/PageHero";
import SectionHeading from "../components/common/SectionHeading";
import MetricCard from "../components/common/MetricCard";
import InsightList from "../components/common/InsightList";
import DataTableCard from "../components/common/DataTableCard";
import DonutChartCard from "../components/charts/DonutChartCard";
import BarComparisonChart from "../components/charts/BarComparisonChart";
import {
  auditDecisionCards,
  auditSummary,
  featureFamilies,
  featureTypeChart,
  missingFamilyChart,
  topMissingFeatures,
} from "../data/siteData";

export default function StructuralAuditPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Structural Audit"
        title="The project got traction only after the data was understood structurally"
        description="This page focuses on the audit-first backbone of the workflow: how the consolidated report shaped missingness handling, family grouping, and the eventual modeling path."
      />

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Consolidated Report"
          value={String(auditSummary.originalConsolidatedFeatures)}
          hint="Columns captured in the master structural report."
          icon={Database}
        />
        <MetricCard
          label="Final Training Features"
          value={String(auditSummary.finalTrainingFeatures)}
          hint="Feature count after report-driven engineering and alignment."
          icon={Layers3}
        />
        <MetricCard
          label="High-Missing Families"
          value={String(auditSummary.highMissingFamilies)}
          hint="Families whose missingness demanded special handling instead of global imputation rules."
          icon={AlertTriangle}
        />
        <MetricCard
          label="Grouped Families"
          value={String(featureFamilies.length)}
          hint="Main family buckets highlighted in the audit summary."
          icon={FolderTree}
        />
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <DonutChartCard
          title="Final Training Feature Mix"
          subtitle="The saved training summary reports 743 numeric and 131 categorical features."
          data={featureTypeChart}
        />
        <BarComparisonChart
          title="Average Missingness by High-Signal Family"
          subtitle="Derived from the saved missingness report, grouped into the families that most influenced downstream decisions."
          data={missingFamilyChart}
          xKey="name"
          yKey="value"
          layout="vertical"
          valueFormatter={(value) => `${Number(value).toFixed(2)}%`}
          heightClass="h-[26rem]"
        />
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Key Findings"
          title="Audit findings that changed the rest of the project"
          subtitle="These are the structural reasons the notebooks did not treat EDA as the first major step."
        />
        <InsightList items={auditSummary.majorThemes} />
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <DataTableCard
          title="Most Missing Features in the Saved Report"
          subtitle="The top missing fields are dominated by credit-card ratio aggregates, which is exactly why the workflow treated history families separately."
          columns={[
            { key: "feature", label: "Feature" },
            {
              key: "missingPct",
              label: "Missing",
              align: "right",
              render: (value) => `${Number(value).toFixed(2)}%`,
            },
            { key: "recommendation", label: "Report Recommendation" },
          ]}
          rows={topMissingFeatures}
        />

        <div className="space-y-6">
          {auditDecisionCards.map((card) => (
            <div key={card.title} className="glass-card p-6">
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Feature Families"
          title="Grouping the report made the project more legible"
          subtitle="The family counts below come from the consolidated report and help explain where later EDA and engineering effort was spent."
        />
        <div className="grid gap-5 lg:grid-cols-2">
          {featureFamilies.map((family) => (
            <div key={family.name} className="soft-card p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold text-white">{family.name}</h3>
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-300">
                  {family.count} columns
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-400">{family.description}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
