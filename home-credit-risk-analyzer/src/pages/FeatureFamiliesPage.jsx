import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DataTableCard from "../components/common/DataTableCard";
import LoadingState from "../components/common/LoadingState";
import PageHero from "../components/common/PageHero";
import PageShell from "../components/common/PageShell";
import SectionHeading from "../components/common/SectionHeading";
import { getFeatureFamilies, getFeatureFamily } from "../services/studioApi";

export default function FeatureFamiliesPage() {
  const [families, setFamilies] = useState([]);
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [familyDetail, setFamilyDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      const payload = await getFeatureFamilies();
      setFamilies(payload.feature_families ?? []);
      const firstFamily = payload.feature_families?.[0]?.feature_family;
      if (firstFamily) {
        setSelectedFamily(firstFamily);
      }
      setLoading(false);
    }

    run();
  }, []);

  useEffect(() => {
    async function run() {
      if (!selectedFamily) return;
      const payload = await getFeatureFamily(selectedFamily);
      setFamilyDetail(payload);
    }

    run();
  }, [selectedFamily]);

  if (loading) {
    return (
      <PageShell>
        <LoadingState
          title="Loading feature families"
          message="Preparing family-level summaries from the structural catalog."
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Feature Families"
        title="Explore the dataset in grouped families instead of isolated columns"
        description="Family-level exploration makes the structural audit more usable by showing how groups of related columns behave, where missingness concentrates, and which groups deserve the most analyst attention."
      />

      <section className="mt-16">
        <SectionHeading
          eyebrow="Family Cards"
          title="Five high-level families organize the exploration experience"
          subtitle="Each card shows structural context first, then lets you drill down into a family-level column list."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {families.map((family) => (
            <button
              type="button"
              key={family.feature_family}
              onClick={() => setSelectedFamily(family.feature_family)}
              className={`text-left transition ${
                selectedFamily === family.feature_family ? "scale-[1.01]" : ""
              }`}
            >
              <div className="soft-card h-full p-6">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-white">{family.feature_family}</h3>
                  <span className="data-pill">{family.feature_count} features</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-400">{family.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="data-pill">
                    Avg missing: {Number(family.average_missingness ?? 0).toFixed(2)}%
                  </span>
                  <span className="data-pill">Priority cols: {family.priority_count ?? 0}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {familyDetail ? (
        <section className="mt-16 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card p-6">
            <SectionHeading
              eyebrow="Selected Family"
              title={familyDetail.feature_family}
              subtitle="Use this detail panel to understand the family before jumping into individual column audits."
            />
            <p className="text-sm leading-7 text-slate-300">{familyDetail.description}</p>
            <div className="mt-6 space-y-3">
              <div className="rounded-[1.15rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                Feature count: {familyDetail.feature_count}
              </div>
              <div className="rounded-[1.15rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                Average missingness: {Number(familyDetail.average_missingness ?? 0).toFixed(2)}%
              </div>
              <div className="rounded-[1.15rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
                Numeric / categorical split: {familyDetail.numeric_count} / {familyDetail.categorical_count}
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                Example Columns
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(familyDetail.examples ?? []).map((item) => (
                  <Link
                    key={item}
                    to={`/column-audit-explorer?column=${encodeURIComponent(item)}`}
                    className="data-pill"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <DataTableCard
            title="Family Column List"
            subtitle="These are the first columns exposed for the selected family, sorted to prioritize important and structurally notable items."
            columns={[
              { key: "column", label: "Column" },
              { key: "dtype_group", label: "Type" },
              {
                key: "missing_percentage",
                label: "Missing %",
                align: "right",
                render: (value) =>
                  value === null || value === undefined ? "-" : `${Number(value).toFixed(2)}%`,
              },
            ]}
            rows={(familyDetail.columns ?? []).slice(0, 20)}
          />
        </section>
      ) : null}
    </PageShell>
  );
}
