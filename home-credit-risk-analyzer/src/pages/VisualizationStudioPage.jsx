import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import LoadingState from "../components/common/LoadingState";
import PageHero from "../components/common/PageHero";
import PageShell from "../components/common/PageShell";
import SectionHeading from "../components/common/SectionHeading";
import PlotRenderer from "../components/visualization/PlotRenderer";
import VisualizationControlPanel from "../components/visualization/VisualizationControlPanel";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { getBivariatePlot, getColumns, getUnivariatePlot } from "../services/studioApi";

const EMPTY_COLUMNS = [];
const SEARCH_LIMIT = 40;
const BIVARIATE_ONLY_PLOTS = new Set(["scatterplot", "regression", "stacked_bar"]);

const initialState = {
  dataset: "train",
  plotType: "histogram",
  xColumn: "AMT_ANNUITY",
  yColumn: "",
  sampleSize: 12000,
  quantileClip: 0.01,
  topN: 12,
  missingStrategy: "drop",
  logScale: false,
  targetOverlay: false,
};

export default function VisualizationStudioPage() {
  const [searchParams] = useSearchParams();
  const initialXColumn = searchParams.get("x") ?? initialState.xColumn;
  const [form, setForm] = useState({
    ...initialState,
    xColumn: initialXColumn,
  });
  const [xSearchQuery, setXSearchQuery] = useState(initialXColumn);
  const [ySearchQuery, setYSearchQuery] = useState("");
  const [xColumns, setXColumns] = useState(EMPTY_COLUMNS);
  const [yColumns, setYColumns] = useState(EMPTY_COLUMNS);
  const [xLoading, setXLoading] = useState(false);
  const [yLoading, setYLoading] = useState(false);
  const [catalogError, setCatalogError] = useState(null);
  const [columnMeta, setColumnMeta] = useState({});
  const [plot, setPlot] = useState(null);
  const [plotLoading, setPlotLoading] = useState(false);
  const [plotError, setPlotError] = useState(null);

  const debouncedXSearch = useDebouncedValue(xSearchQuery, 250);
  const debouncedYSearch = useDebouncedValue(ySearchQuery, 250);

  useEffect(() => {
    const nextXColumn = searchParams.get("x");
    if (nextXColumn) {
      setForm((prev) => ({ ...prev, xColumn: nextXColumn }));
      setXSearchQuery(nextXColumn);
    }
  }, [searchParams]);

  useEffect(() => {
    let active = true;
    const query = debouncedXSearch.trim() || form.xColumn || "";
    setXLoading(true);

    async function run() {
      try {
        const results = await getColumns({ query, limit: SEARCH_LIMIT });
        if (!active) return;
        setCatalogError(null);
        setXColumns(ensureSelectedOption(results, form.xColumn));
        setColumnMeta((prev) => mergeColumnMetadata(prev, results));
      } catch (error) {
        if (!active) return;
        setCatalogError(error);
        setXColumns(ensureSelectedOption([], form.xColumn));
      } finally {
        if (active) {
          setXLoading(false);
        }
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [debouncedXSearch, form.xColumn]);

  useEffect(() => {
    let active = true;
    const query = debouncedYSearch.trim() || form.yColumn || "";
    setYLoading(true);

    async function run() {
      try {
        const results = await getColumns({ query, limit: SEARCH_LIMIT });
        if (!active) return;
        setCatalogError(null);
        setYColumns(ensureSelectedOption(results, form.yColumn));
        setColumnMeta((prev) => mergeColumnMetadata(prev, results));
      } catch (error) {
        if (!active) return;
        setCatalogError(error);
        setYColumns(ensureSelectedOption([], form.yColumn));
      } finally {
        if (active) {
          setYLoading(false);
        }
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [debouncedYSearch, form.yColumn]);

  const selectedX = columnMeta[form.xColumn];

  const guidance = useMemo(() => {
    const items = [];
    if (form.xColumn?.includes("AMT_ANNUITY")) {
      items.push("Try comparing AMT_ANNUITY against AMT_CREDIT or switch to a target overlay histogram.");
    }
    if (form.xColumn?.includes("EXT_SOURCE")) {
      items.push("External source fields are strongest when paired with target-aware views or compared against each other.");
    }
    if (selectedX?.dtype_group === "categorical") {
      items.push("Countplot and target-rate views are usually more useful than raw stacked charts for first inspection.");
    }
    if (!items.length) {
      items.push("Pick the columns first, then request one chart at a time. The backend only returns the selected plot payload.");
    }
    return items;
  }, [form.xColumn, selectedX?.dtype_group]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.xColumn) {
      setPlotError(new Error("Select at least one feature before requesting a plot."));
      return;
    }
    if (!form.yColumn && BIVARIATE_ONLY_PLOTS.has(form.plotType)) {
      setPlotError(new Error("Select a second feature for scatter, regression, or stacked categorical plots."));
      return;
    }

    setPlotLoading(true);
    setPlotError(null);

    try {
      const payload = form.yColumn
        ? await getBivariatePlot({
            dataset: form.dataset,
            x_column: form.xColumn,
            y_column: form.yColumn,
            plot_type: form.plotType,
            sample_size: form.sampleSize,
            quantile_clip: form.quantileClip || 0,
            missing_strategy: form.missingStrategy,
            log_scale: form.logScale,
            top_n: form.topN,
          })
        : await getUnivariatePlot({
            dataset: form.dataset,
            column: form.xColumn,
            plot_type: form.plotType,
            sample_size: form.sampleSize,
            quantile_clip: form.quantileClip || 0,
            missing_strategy: form.missingStrategy,
            log_scale: form.logScale,
            top_n: form.topN,
            target_overlay: form.targetOverlay,
          });
      setPlot(payload);
    } catch (error) {
      setPlotError(error);
    } finally {
      setPlotLoading(false);
    }
  }

  function handleReset() {
    setForm(initialState);
    setXSearchQuery(initialState.xColumn);
    setYSearchQuery("");
    setPlot(null);
    setPlotError(null);
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Visualization Studio"
        title="Manually generate meaningful charts instead of browsing a cluttered dashboard"
        description="Choose one or two features, then request the plot. The backend reads only the selected columns and returns chart-ready data after you click Render Plot."
      />

      <section className="mt-10 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-6">
          <VisualizationControlPanel
            values={form}
            onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
            onReset={handleReset}
            onSubmit={handleSubmit}
            xColumns={xColumns}
            yColumns={yColumns}
            xSearchQuery={xSearchQuery}
            ySearchQuery={ySearchQuery}
            onXSearchChange={setXSearchQuery}
            onYSearchChange={setYSearchQuery}
            xLoading={xLoading}
            yLoading={yLoading}
            loading={plotLoading}
            backendOnly
          />

          {catalogError ? (
            <ErrorState
              title="Feature search unavailable"
              message="Visualization now depends on backend feature search so you can work with the full column list. Start the API and try again."
            />
          ) : null}

          <div className="glass-card p-6">
            <SectionHeading
              eyebrow="How To Interpret This"
              title="Use the studio to answer one question at a time"
              subtitle="The strongest visualizations usually start from an audit observation, not from a random chart type."
            />
            <ul className="space-y-3 text-sm leading-7 text-slate-300">
              <li>Pick the feature or pair of features first, then request the plot.</li>
              <li>The backend returns only the chart-ready payload for that selection.</li>
              <li>Use clipping and log scale deliberately, then read the metadata panel after rendering.</li>
            </ul>
          </div>

          <div className="soft-card p-6">
            <SectionHeading
              eyebrow="Quick Suggestions"
              title="What to try next"
              subtitle="These hints update from the current feature selection instead of preloading a gallery of charts."
            />
            <ul className="space-y-3 text-sm leading-7 text-slate-300">
              {guidance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="space-y-6">
          {plotLoading ? (
            <LoadingState
              title="Rendering visualization"
              message="The backend is reading the selected columns and preparing the chart payload."
            />
          ) : plotError ? (
            <ErrorState title="Plot rendering failed" message={plotError.message} />
          ) : plot ? (
            <>
              <PlotRenderer plot={plot} />
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="glass-card p-6">
                  <SectionHeading
                    eyebrow="Plot Metadata"
                    title="What happened under the hood"
                    subtitle="The studio reports how the selected controls affected the current backend-rendered chart."
                  />
                  <div className="space-y-3">
                    {Object.entries(plot.metadata).map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-[1.15rem] border border-white/10 bg-slate-950/70 px-4 py-3"
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{key}</p>
                        <p className="mt-2 text-sm text-slate-200">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="soft-card p-6">
                  <SectionHeading
                    eyebrow="Quick Stats"
                    title="Summary values for the current render"
                    subtitle="These values come from the exact sampled frame used by the backend for this chart."
                  />
                  <div className="space-y-3">
                    {plot.stats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[1.15rem] border border-white/10 bg-slate-950/70 px-4 py-3"
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="soft-card p-6">
                <SectionHeading
                  eyebrow="Plot Recommendations"
                  title="What to explore after this chart"
                  subtitle="These suggestions come after the selected plot is rendered, not before."
                />
                <ul className="space-y-3 text-sm leading-7 text-slate-300">
                  {(plot.recommendations ?? []).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <EmptyState
              title="No visualization yet"
              message="Search the features you want and click Render Plot. The chart will be requested from the backend on demand."
            />
          )}
        </div>
      </section>
    </PageShell>
  );
}

function ensureSelectedOption(options, selectedValue) {
  if (!selectedValue) {
    return options;
  }
  if (options.some((item) => item.column === selectedValue)) {
    return options;
  }
  return [{ column: selectedValue, description: selectedValue }, ...options];
}

function mergeColumnMetadata(existingMap, options) {
  const nextMap = { ...existingMap };
  options.forEach((option) => {
    nextMap[option.column] = option;
  });
  return nextMap;
}
