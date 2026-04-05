import SearchableSelect from "../common/SearchableSelect";

const DATASET_OPTIONS = [
  { value: "train", label: "Train" },
  { value: "test", label: "Test" },
  { value: "combined", label: "Combined" },
];

const PLOT_OPTIONS = [
  { value: "histogram", label: "Histogram" },
  { value: "kde", label: "KDE" },
  { value: "boxplot", label: "Boxplot" },
  { value: "violinplot", label: "Violinplot" },
  { value: "countplot", label: "Countplot" },
  { value: "barplot", label: "Barplot" },
  { value: "target_rate", label: "Target Rate Chart" },
  { value: "scatterplot", label: "Scatterplot" },
  { value: "regression", label: "Regression-Style Scatter" },
  { value: "stacked_bar", label: "Stacked Categorical Chart" },
];

export default function VisualizationControlPanel({
  values,
  onChange,
  onReset,
  onSubmit,
  xColumns,
  yColumns,
  xSearchQuery,
  ySearchQuery,
  onXSearchChange,
  onYSearchChange,
  xLoading,
  yLoading,
  loading,
  backendOnly = false,
}) {
  return (
    <form onSubmit={onSubmit} className="soft-card p-6">
      {backendOnly ? (
        <div className="mb-5 rounded-[1.2rem] border border-cyan-400/20 bg-cyan-400/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
            Backend-Driven Plotting
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Search the features you want, then click Render Plot. No chart data is preloaded.
          </p>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <SelectField
          label="Dataset"
          value={values.dataset}
          onChange={(value) => onChange("dataset", value)}
          options={DATASET_OPTIONS}
        />
        <SelectField
          label="Plot Type"
          value={values.plotType}
          onChange={(value) => onChange("plotType", value)}
          options={PLOT_OPTIONS}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <SearchableSelect
          label="X Column"
          value={values.xColumn}
          onChange={(value) => onChange("xColumn", value)}
          options={xColumns}
          query={xSearchQuery}
          onQueryChange={onXSearchChange}
          loading={xLoading}
          placeholder="Search x column"
          getLabel={(option) => option.column}
          getValue={(option) => option.column}
          selectedLabel={values.xColumn}
          helperText="Search any feature. Suggestions come from the backend."
        />
        <SearchableSelect
          label="Y Column"
          value={values.yColumn}
          onChange={(value) => onChange("yColumn", value)}
          options={yColumns}
          query={ySearchQuery}
          onQueryChange={onYSearchChange}
          loading={yLoading}
          placeholder="Optional for univariate plots"
          getLabel={(option) => option.column}
          getValue={(option) => option.column}
          selectedLabel={values.yColumn}
          helperText="Leave empty for univariate plots. Add a second feature for backend bivariate plots."
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <NumberField
          label="Sample Size"
          value={values.sampleSize}
          onChange={(value) => onChange("sampleSize", value)}
          min={500}
          max={50000}
          step={500}
        />
        <NumberField
          label="Quantile Clip"
          value={values.quantileClip}
          onChange={(value) => onChange("quantileClip", value)}
          min={0}
          max={0.2}
          step={0.01}
        />
        <NumberField
          label="Top Categories"
          value={values.topN}
          onChange={(value) => onChange("topN", value)}
          min={5}
          max={25}
          step={1}
        />
        <SelectField
          label="Missing Handling"
          value={values.missingStrategy}
          onChange={(value) => onChange("missingStrategy", value)}
          options={[
            { value: "drop", label: "Drop Missing" },
            { value: "keep", label: "Keep Missing" },
          ]}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-6">
        <ToggleField
          label="Log Scale"
          checked={values.logScale}
          onChange={(value) => onChange("logScale", value)}
        />
        <ToggleField
          label="Target Overlay"
          checked={values.targetOverlay}
          onChange={(value) => onChange("targetOverlay", value)}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading ? "Rendering..." : "Render Plot"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
        >
          Reset Controls
        </button>
      </div>
    </form>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[1.15rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({ label, value, onChange, min, max, step }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-[1.15rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
      />
    </label>
  );
}

function ToggleField({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-3 text-sm text-slate-300">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-white/20 bg-slate-950 text-cyan-400"
      />
      {label}
    </label>
  );
}
