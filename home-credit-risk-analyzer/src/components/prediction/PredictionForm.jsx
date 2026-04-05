import { useState } from "react";

import { formatPercent } from "../../utils/formatters";

const stableScenario = {
  gender: "F",
  educationType: "Higher education",
  incomeType: "Working",
  familyStatus: "Married",
  housingType: "House / apartment",
  occupationType: "Laborers",
  incomeTotal: 180000,
  creditAmount: 600000,
  annuityAmount: 25000,
  goodsPrice: 540000,
  ageYears: 35,
  employedYears: 6,
  familyMembers: 3,
  children: 1,
  phoneChangeYears: 2,
  socialObs30: 0,
  socialDef30: 0,
  bureauReqYear: 1,
  totalArea: 120,
};

const highRiskScenario = {
  ...stableScenario,
  incomeTotal: 85000,
  creditAmount: 950000,
  annuityAmount: 48000,
  goodsPrice: 910000,
  ageYears: 26,
  employedYears: 1,
  familyMembers: 4,
  children: 2,
  phoneChangeYears: 0.5,
  bureauReqYear: 5,
  socialObs30: 3,
  socialDef30: 2,
  occupationType: "Unemployed",
  incomeType: "Unemployed",
};

export default function PredictionForm({ onPredict, loading }) {
  const [form, setForm] = useState(stableScenario);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onPredict(form);
  };

  const annuityIncomeRatio = form.annuityAmount / Math.max(form.incomeTotal, 1);
  const creditIncomeRatio = form.creditAmount / Math.max(form.incomeTotal, 1);
  const goodsCreditGap =
    Math.abs(form.creditAmount - form.goodsPrice) / Math.max(form.creditAmount, 1);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="glass-card p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">Applicant Profile</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
              The form uses representative applicant, loan, and bureau inputs from the broader
              notebook workflow so the demo stays understandable while preserving the prediction
              contract shape.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setForm(stableScenario)}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
            >
              Use Stable Scenario
            </button>
            <button
              type="button"
              onClick={() => setForm(highRiskScenario)}
              className="rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-200"
            >
              Use High-Risk Scenario
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <ScenarioMetric
            label="Annuity burden"
            value={formatPercent(annuityIncomeRatio, 1)}
            hint="Loan payment pressure relative to income."
          />
          <ScenarioMetric
            label="Credit load"
            value={`${creditIncomeRatio.toFixed(2)}x`}
            hint="Credit amount relative to yearly income."
          />
          <ScenarioMetric
            label="Goods-credit gap"
            value={formatPercent(goodsCreditGap, 1)}
            hint="How far the goods price sits from the requested credit."
          />
          <ScenarioMetric
            label="Household pressure"
            value={`${form.familyMembers} members`}
            hint="Household size still matters when income is limited."
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <FormSection
          title="Borrower Context"
          subtitle="Demographic and employment signals that shape risk context."
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <SelectField
              label="Gender"
              value={form.gender}
              onChange={(value) => updateField("gender", value)}
              options={["F", "M"]}
            />
            <SelectField
              label="Education Type"
              value={form.educationType}
              onChange={(value) => updateField("educationType", value)}
              options={[
                "Higher education",
                "Secondary / secondary special",
                "Incomplete higher",
                "Lower secondary",
              ]}
            />
            <SelectField
              label="Income Type"
              value={form.incomeType}
              onChange={(value) => updateField("incomeType", value)}
              options={[
                "Working",
                "Commercial associate",
                "State servant",
                "Pensioner",
                "Unemployed",
              ]}
            />
            <SelectField
              label="Family Status"
              value={form.familyStatus}
              onChange={(value) => updateField("familyStatus", value)}
              options={["Married", "Single", "Civil marriage", "Separated", "Widow"]}
            />
            <SelectField
              label="Housing Type"
              value={form.housingType}
              onChange={(value) => updateField("housingType", value)}
              options={[
                "House / apartment",
                "Rented apartment",
                "Municipal apartment",
                "With parents",
              ]}
            />
            <SelectField
              label="Occupation Type"
              value={form.occupationType}
              onChange={(value) => updateField("occupationType", value)}
              options={[
                "Laborers",
                "Core staff",
                "Managers",
                "Sales staff",
                "Drivers",
                "Security staff",
                "Unemployed",
              ]}
            />
          </div>
        </FormSection>

        <FormSection
          title="Loan Structure"
          subtitle="Core financial inputs that drive the strongest burden-related features."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField
              label="Total Income"
              value={form.incomeTotal}
              onChange={(value) => updateField("incomeTotal", value)}
            />
            <NumberField
              label="Credit Amount"
              value={form.creditAmount}
              onChange={(value) => updateField("creditAmount", value)}
            />
            <NumberField
              label="Annuity Amount"
              value={form.annuityAmount}
              onChange={(value) => updateField("annuityAmount", value)}
            />
            <NumberField
              label="Goods Price"
              value={form.goodsPrice}
              onChange={(value) => updateField("goodsPrice", value)}
            />
          </div>
        </FormSection>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <FormSection
          title="Time And Household Signals"
          subtitle="Compact versions of the personal history and household fields used in the demo engine."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <NumberField
              label="Age (Years)"
              value={form.ageYears}
              onChange={(value) => updateField("ageYears", value)}
            />
            <NumberField
              label="Employed Years"
              value={form.employedYears}
              onChange={(value) => updateField("employedYears", value)}
            />
            <NumberField
              label="Family Members"
              value={form.familyMembers}
              onChange={(value) => updateField("familyMembers", value)}
            />
            <NumberField
              label="Children"
              value={form.children}
              onChange={(value) => updateField("children", value)}
            />
            <NumberField
              label="Years Since Last Phone Change"
              value={form.phoneChangeYears}
              onChange={(value) => updateField("phoneChangeYears", value)}
            />
            <NumberField
              label="Total Area"
              value={form.totalArea}
              onChange={(value) => updateField("totalArea", value)}
            />
          </div>
        </FormSection>

        <FormSection
          title="Advanced Risk Signals"
          subtitle="Small but useful stress indicators taken from the report-driven project workflow."
        >
          <div className="grid gap-4 md:grid-cols-3">
            <NumberField
              label="OBS 30 Social Circle"
              value={form.socialObs30}
              onChange={(value) => updateField("socialObs30", value)}
            />
            <NumberField
              label="DEF 30 Social Circle"
              value={form.socialDef30}
              onChange={(value) => updateField("socialDef30", value)}
            />
            <NumberField
              label="Bureau Requests (Year)"
              value={form.bureauReqYear}
              onChange={(value) => updateField("bureauReqYear", value)}
            />
          </div>
        </FormSection>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {loading ? "Predicting..." : "Run Risk Prediction"}
        </button>
      </div>
    </form>
  );
}

function FormSection({ title, subtitle, children }) {
  return (
    <div className="soft-card p-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-7 text-slate-400">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function ScenarioMetric({ label, value, hint }) {
  return (
    <div className="rounded-[1.3rem] border border-white/10 bg-slate-950/60 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-400">{hint}</p>
    </div>
  );
}

function NumberField({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-[1.15rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400/40"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[1.15rem] border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400/40"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-slate-950">
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
