import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import AuditFlagList from "../components/audit/AuditFlagList";
import AuditRecommendations from "../components/audit/AuditRecommendations";
import RawReportGrid from "../components/audit/RawReportGrid";
import RelatedColumnsPanel from "../components/audit/RelatedColumnsPanel";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import MetricCard from "../components/common/MetricCard";
import PageHero from "../components/common/PageHero";
import PageShell from "../components/common/PageShell";
import SearchableSelect from "../components/common/SearchableSelect";
import SectionHeading from "../components/common/SectionHeading";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import {
  getColumnReport,
  getColumns,
  getFeatureFamilies,
} from "../services/studioApi";
import { formatPercent } from "../utils/formatters";

const tabs = ["Summary", "Recommendations", "Related Columns", "Raw Report"];

export default function ColumnAuditExplorerPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    query: searchParams.get("query") ?? "",
    family: searchParams.get("family") ?? "",
    dtype: searchParams.get("dtype") ?? "",
    missingThreshold: searchParams.get("missing") ? Number(searchParams.get("missing")) : 0,
    priorityOnly: searchParams.get("priority") === "true",
  });
  const [columnOptions, setColumnOptions] = useState([]);
  const [familyOptions, setFamilyOptions] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState(searchParams.get("column") ?? "AMT_ANNUITY");
  const [report, setReport] = useState(null);
  const [loadingColumns, setLoadingColumns] = useState(true);
  const [loadingReport, setLoadingReport] = useState(true);
  const [columnsError, setColumnsError] = useState(null);
  const [reportError, setReportError] = useState(null);
  const [activeTab, setActiveTab] = useState("Summary");
  const reportRequestRef = useRef(0);

  const debouncedQuery = useDebouncedValue(filters.query, 250);

  useEffect(() => {
    async function loadFamilies() {
      const payload = await getFeatureFamilies();
      setFamilyOptions(payload.feature_families ?? []);
    }

    loadFamilies();
  }, []);

  useEffect(() => {
    let active = true;
    setLoadingColumns(true);
    setColumnsError(null);

    async function run() {
      try {
        const payload = await getColumns({
          query: debouncedQuery,
          family: filters.family,
          dtype: filters.dtype,
          missing_threshold: filters.missingThreshold || undefined,
          priority_only: filters.priorityOnly,
        });

        if (!active) return;
        setColumnOptions(payload);
        if (payload.length && !payload.some((item) => item.column === selectedColumn)) {
          setSelectedColumn(payload[0].column);
        }
      } catch (error) {
        if (active) {
          setColumnsError(error);
        }
      } finally {
        if (active) {
          setLoadingColumns(false);
        }
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [debouncedQuery, filters.dtype, filters.family, filters.missingThreshold, filters.priorityOnly, selectedColumn]);

  useEffect(() => {
    const requestId = reportRequestRef.current + 1;
    reportRequestRef.current = requestId;
    setLoadingReport(true);
    setReportError(null);

    async function run() {
      try {
        const payload = await getColumnReport(selectedColumn);
        if (reportRequestRef.current === requestId) {
          setReport(payload);
        }
      } catch (error) {
        if (reportRequestRef.current === requestId) {
          setReportError(error);
        }
      } finally {
        if (reportRequestRef.current === requestId) {
          setLoadingReport(false);
        }
      }
    }

    if (selectedColumn) {
      run();
    } else {
      setReport(null);
      setLoadingReport(false);
    }
  }, [selectedColumn]);

  useEffect(() => {
    const nextParams = { column: selectedColumn };
    if (filters.query) nextParams.query = filters.query;
    if (filters.family) nextParams.family = filters.family;
    if (filters.dtype) nextParams.dtype = filters.dtype;
    if (filters.missingThreshold) nextParams.missing = String(filters.missingThreshold);
    if (filters.priorityOnly) nextParams.priority = "true";

    setSearchParams(nextParams, { replace: true });
  }, [
    filters.dtype,
    filters.family,
    filters.missingThreshold,
    filters.priorityOnly,
    filters.query,
    selectedColumn,
    setSearchParams,
  ]);

  const identityCards = useMemo(() => {
    if (!report) return [];
    return [
      {
        label: "Missing %",
        value: formatPercent(report.structural_stats.missing_pct ?? 0, 2),
        hint: "Share of missing values in the consolidated train dataset.",
      },
      {
        label: "Unique Count",
        value: `${report.structural_stats.unique_count}`,
        hint: "Distinct non-null values.",
      },
      {
        label: "Zero %",
        value: formatPercent(report.structural_stats.zero_pct ?? 0, 2),
        hint: "Useful for sparse or zero-heavy numeric signals.",
      },
      {
        label: "Family",
        value: report.identity.feature_family,
        hint: "Family context used for grouped interpretation and recommendations.",
      },
    ];
  }, [report]);

  return (
    <PageShell>
      <PageHero
        eyebrow="Column Audit Explorer"
        title="Inspect any consolidated column through its full structural audit profile"
        description="Select a column, read its structural statistics, see the audit flags and recommendations, compare related columns, and inspect the raw report fields that generated the summary."
      />

      <section className="mt-10 grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="soft-card p-6">
          <SectionHeading
            eyebrow="Explorer Controls"
            title="Filter the catalog before selecting a column"
            subtitle="The filters below narrow the 584-column catalog by name, family, dtype, missingness, and priority hints."
          />

          <div className="space-y-5">
            <SearchableSelect
              label="Column"
              value={selectedColumn}
              onChange={(value) => setSelectedColumn(value)}
              options={columnOptions}
              getLabel={(option) => option.column}
              getValue={(option) => option.column}
              placeholder="Search for a column"
            />

            <label className="block">
              <span className="mb-2 block text-sm text-slate-300">Search Catalog</span>
              <input
                type="text"
                value={filters.query}
                onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
                placeholder="Search by column name or description"
                className="w-full rounded-[1.15rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Feature Family</span>
                <select
                  value={filters.family}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, family: event.target.value }))
                  }
                  className="w-full rounded-[1.15rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                >
                  <option value="">All families</option>
                  {familyOptions.map((family) => (
                    <option key={family.feature_family} value={family.feature_family}>
                      {family.feature_family}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Dtype</span>
                <select
                  value={filters.dtype}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, dtype: event.target.value }))
                  }
                  className="w-full rounded-[1.15rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                >
                  <option value="">All types</option>
                  <option value="numeric">Numeric</option>
                  <option value="categorical">Categorical</option>
                </select>
              </label>
            </div>

            <div className="grid gap-5 md:grid-cols-[1fr_auto]">
              <label className="block">
                <span className="mb-2 block text-sm text-slate-300">Missing Threshold (%)</span>
                <input
                  type="number"
                  value={filters.missingThreshold}
                  min={0}
                  max={100}
                  step={5}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      missingThreshold: Number(event.target.value),
                    }))
                  }
                  className="w-full rounded-[1.15rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
                />
              </label>

              <label className="inline-flex items-center gap-3 self-end rounded-[1.15rem] border border-white/10 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={filters.priorityOnly}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, priorityOnly: event.target.checked }))
                  }
                />
                Priority only
              </label>
            </div>
          </div>

          <div className="mt-6 rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              How To Interpret This
            </p>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              Start with the Summary tab to understand the column structurally, then move to
              Recommendations before plotting. The raw report is useful last, when you want to see
              exactly which audit fields drove the explanation.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {loadingColumns ? (
            <LoadingState
              title="Loading column catalog"
              message="Filtering the consolidated audit catalog."
            />
          ) : columnsError ? (
            <ErrorState title="Catalog unavailable" message={columnsError.message} />
          ) : null}

          {loadingReport ? (
            <LoadingState
              title="Loading column report"
              message="Reading audit details and recommendations for the selected column."
            />
          ) : reportError ? (
            <ErrorState title="Column report unavailable" message={reportError.message} />
          ) : report ? (
            <>
              <div className="gradient-border p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
                      Selected Column
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold text-white">
                      {report.identity.column_name}
                    </h2>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                      {report.identity.short_description}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="data-pill">{report.identity.dtype}</span>
                    <span className="data-pill">{report.identity.dtype_group}</span>
                    <span className="data-pill">{report.identity.feature_family}</span>
                    {report.identity.priority_flag ? <span className="eyebrow-chip">Priority</span> : null}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/visualization-studio?x=${encodeURIComponent(report.identity.column_name)}`}
                    className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
                  >
                    Open In Visualization Studio
                  </Link>
                </div>
              </div>

              <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {identityCards.map((card) => (
                  <MetricCard
                    key={card.label}
                    label={card.label}
                    value={card.value}
                    hint={card.hint}
                  />
                ))}
              </section>

              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activeTab === tab
                        ? "bg-cyan-400 text-slate-950"
                        : "border border-white/10 bg-white/5 text-slate-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "Summary" ? (
                <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
                  <div className="glass-card p-6">
                    <SectionHeading
                      eyebrow="Structural Stats"
                      title="Column profile"
                      subtitle="These are the core structural metrics you should read before deciding whether to visualize, transform, keep, or review the feature."
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(report.structural_stats).map(([key, value]) => (
                        <div key={key} className="rounded-[1.15rem] border border-white/10 bg-slate-950/60 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{key}</p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {typeof value === "number" ? value.toFixed(4) : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="soft-card p-6">
                    <SectionHeading
                      eyebrow="Distribution Summary"
                      title="Type-aware summary"
                      subtitle="Numeric columns show distribution metrics. Categorical columns emphasize concentration, rarity, and top values."
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      {Object.entries(report.distribution_summary)
                        .filter(([key]) => key !== "kind" && key !== "top_categories")
                        .map(([key, value]) => (
                          <div key={key} className="rounded-[1.15rem] border border-white/10 bg-slate-950/60 px-4 py-3">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{key}</p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {typeof value === "number" ? value.toFixed(4) : String(value)}
                            </p>
                          </div>
                        ))}
                    </div>
                    {report.family_context ? (
                      <div className="mt-6 rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                          Family Context
                        </p>
                        <p className="mt-3 text-sm leading-7 text-slate-300">
                          {report.family_context.description}
                        </p>
                        <p className="mt-3 text-sm text-slate-400">
                          {report.family_context.feature_count} columns in this family with average
                          missingness around {formatPercent(report.family_context.average_missingness ?? 0, 1)}.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {activeTab === "Recommendations" ? (
                <div className="space-y-6">
                  <div className="glass-card p-6">
                    <SectionHeading
                      eyebrow="Audit Flags"
                      title="Which structural risks are currently active"
                      subtitle="Flags are meant to guide the next action, not to replace judgment."
                    />
                    <AuditFlagList flags={report.audit_flags} />
                  </div>
                  <div className="soft-card p-6">
                    <SectionHeading
                      eyebrow="Recommendations"
                      title="What to do next with this column"
                      subtitle="The recommendations combine report suggestions with family-aware heuristics."
                    />
                    <AuditRecommendations recommendations={report.recommendations} />
                  </div>
                </div>
              ) : null}

              {activeTab === "Related Columns" ? (
                <div className="soft-card p-6">
                  <SectionHeading
                    eyebrow="Related Columns"
                    title="Sibling and same-family columns worth comparing next"
                    subtitle="Use these to move directly into manual visualization and family-aware interpretation."
                  />
                  <RelatedColumnsPanel items={report.related_columns} />
                </div>
              ) : null}

              {activeTab === "Raw Report" ? (
                <div className="glass-card p-6">
                  <SectionHeading
                    eyebrow="Raw Audit Fields"
                    title="Full report payload for the selected column"
                    subtitle="This mirrors the raw structural report fields so you can inspect the underlying audit values directly."
                  />
                  <RawReportGrid report={report.raw_report} />
                </div>
              ) : null}
            </>
          ) : (
            <EmptyState
              title="No column selected"
              message="Choose a column from the explorer controls to view its audit profile."
            />
          )}
        </div>
      </section>
    </PageShell>
  );
}
