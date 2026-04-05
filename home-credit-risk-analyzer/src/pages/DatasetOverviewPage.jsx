import { useState } from "react";
import { BarChart3, Database, Layers3, ShieldCheck } from "lucide-react";

import DataTableCard from "../components/common/DataTableCard";
import LoadingState from "../components/common/LoadingState";
import MetricCard from "../components/common/MetricCard";
import PageHero from "../components/common/PageHero";
import PageShell from "../components/common/PageShell";
import SectionHeading from "../components/common/SectionHeading";
import DonutChartCard from "../components/charts/DonutChartCard";
import { useAsyncData } from "../hooks/useAsyncData";
import { getOverview } from "../services/studioApi";

const icons = [Database, Layers3, BarChart3, ShieldCheck];

export default function DatasetOverviewPage() {
  const { data: overview, loading } = useAsyncData(() => getOverview(), []);
  const [query, setQuery] = useState("");

  const filteredColumns = !overview?.columns
    ? []
    : (() => {
        const search = query.trim().toLowerCase();
        if (!search) return overview.columns.slice(0, 24);
        return overview.columns
          .filter(
            (item) =>
              item.column.toLowerCase().includes(search) ||
              item.description.toLowerCase().includes(search)
          )
          .slice(0, 24);
      })();

  if (loading || !overview) {
    return (
      <PageShell>
        <LoadingState
          title="Loading dataset overview"
          message="Preparing the consolidated dataset summary and column catalog."
        />
      </PageShell>
    );
  }

  const summaryCards = [
    { label: "Train Rows", value: `${overview.train_rows.toLocaleString()}`, hint: "Processed training rows." },
    { label: "Total Columns", value: `${overview.total_columns}`, hint: "Consolidated columns in the audit dataset." },
    { label: "Missing-Heavy Columns", value: `${overview.missing_heavy_columns}`, hint: "Columns at or above the high-missing threshold." },
    { label: "Target Available", value: overview.target_available ? "Yes" : "No", hint: "Target-aware analysis is available on train." },
  ];

  return (
    <PageShell>
      <PageHero
        eyebrow="Dataset Overview"
        title="A compact summary of the data foundation behind the audit and visualization studio"
        description="This page introduces the processed train/test sources, the scale of the consolidated dataset, the main feature type split, and the searchable column catalog used throughout the explorer."
      />

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card, index) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
            icon={icons[index]}
          />
        ))}
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-2">
        <DonutChartCard
          title="Feature Type Distribution"
          subtitle="Numeric columns dominate the consolidated dataset, but the categorical subset is still large enough to demand careful encoding and category-aware visualizations."
          data={overview.feature_type_distribution}
        />
        <div className="soft-card p-6">
          <SectionHeading
            eyebrow="Structural Insights"
            title="Top-level observations from the processed dataset"
            subtitle="These are the high-level reasons the product is structured around audit and guided exploration."
          />
          <ul className="space-y-4 text-sm leading-7 text-slate-300">
            {overview.top_structural_insights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-16 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <DataTableCard
          title="Dataset Preview"
          subtitle="A small preview from the consolidated train dataset used by the audit explorer and manual visualization APIs."
          columns={Object.keys(overview.preview_rows[0] ?? {}).map((key) => ({
            key,
            label: key,
          }))}
          rows={overview.preview_rows}
        />

        <DataTableCard
          title="Source Files Summary"
          subtitle="Version 1 of the studio is centered on the processed consolidated train/test files plus the audit reports that describe them."
          columns={[
            { key: "name", label: "File" },
            { key: "role", label: "Role" },
          ]}
          rows={overview.source_files}
        />
      </section>

      <section className="mt-16 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="soft-card p-6">
          <SectionHeading
            eyebrow="Column Search"
            title="Search the consolidated column catalog"
            subtitle="Use this list to scan names, descriptions, and structural hints before opening the full column audit explorer."
          />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search columns or descriptions"
            className="mt-2 w-full rounded-[1.15rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
          />
          {overview.fallback ? (
            <p className="mt-3 text-xs text-amber-200">
              API fallback is active. Column results are being served from a small demo payload.
            </p>
          ) : null}
        </div>

        <DataTableCard
          title="Searchable Column List"
          subtitle="The explorer filters this same catalog by family, dtype, missingness, and priority."
          columns={[
            { key: "column", label: "Column" },
            { key: "feature_family", label: "Family" },
            { key: "dtype_group", label: "Type" },
            {
              key: "missing_percentage",
              label: "Missing %",
              align: "right",
              render: (value) =>
                value === null || value === undefined ? "-" : `${Number(value).toFixed(2)}%`,
            },
          ]}
          rows={filteredColumns}
        />
      </section>
    </PageShell>
  );
}
