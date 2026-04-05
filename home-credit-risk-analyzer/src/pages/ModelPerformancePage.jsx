import BarComparisonChart from "../components/charts/BarComparisonChart";
import LineTrendChart from "../components/charts/LineTrendChart";
import InsightList from "../components/common/InsightList";
import MetricCard from "../components/common/MetricCard";
import PageHero from "../components/common/PageHero";
import PageShell from "../components/common/PageShell";
import SectionHeading from "../components/common/SectionHeading";
import { modelCards, modelInterpretationPoints, modelMetrics } from "../data/siteData";

const comparisonData = [
  { model: "Baseline Validation", value: modelMetrics.baselineAuc },
  { model: "Mean CV", value: modelMetrics.meanCvAuc },
  { model: "OOF", value: modelMetrics.oofAuc },
];

const cvData = [
  { fold: "Fold 1", score: 0.7894948178 },
  { fold: "Fold 2", score: 0.7894233227 },
  { fold: "Fold 3", score: 0.7894384297 },
];

const importanceData = [
  { name: "APP_EXT_SOURCE_MEAN", value: 8.1518 },
  { name: "APP_EXT_SOURCE_MAX", value: 4.3369 },
  { name: "APP_EXT_SOURCE_MIN", value: 2.7219 },
  { name: "EXT_SOURCE_3", value: 2.2311 },
  { name: "BUREAU_BUREAU_DEBT_CREDIT_RATIO_RAW_MAX", value: 1.968 },
  { name: "EXT_SOURCE_2", value: 1.8707 },
  { name: "AMT_ANNUITY", value: 1.5138 },
  { name: "APP_CREDIT_ANNUITY_RATIO", value: 1.433 },
];

export default function ModelPerformancePage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Model Performance"
        title="The model page closes the loop by connecting disciplined process to a stable result"
        description="These are the actual training summary metrics for the fast GPU CatBoost run, along with feature importance and a short interpretation of what the scores mean."
      />

      <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {modelCards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            hint={card.hint}
          />
        ))}
      </section>

      <section className="mt-16 grid gap-6 xl:grid-cols-2">
        <BarComparisonChart
          title="Performance Summary"
          subtitle="Validation, CV, and OOF metrics stay close, which supports the claim that the training setup was reasonably stable."
          data={comparisonData}
          xKey="model"
          yKey="value"
          valueFormatter={(value) => Number(value).toFixed(4)}
        />
        <LineTrendChart
          title="Fold Stability"
          subtitle="The 3-fold CV trace shows very tight fold spread."
          data={cvData}
          xKey="fold"
          yKey="score"
          yFormatter={(value) => Number(value).toFixed(4)}
          yDomain={[0.7893, 0.7896]}
        />
      </section>

      <section className="mt-16">
        <BarComparisonChart
          title="Top Feature Importances"
          subtitle="The model performance story is strongest when read together with the audit and EDA pages: external source features and burden-related signals continue to dominate."
          data={importanceData}
          xKey="name"
          yKey="value"
          layout="vertical"
          valueFormatter={(value) => Number(value).toFixed(2)}
          heightClass="h-[28rem]"
        />
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Interpretation"
          title="What the scores mean in context"
          subtitle="This project treats the model result as the outcome of a structured process, not as a detached leaderboard number."
        />
        <InsightList items={modelInterpretationPoints} />
      </section>

      <section className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Baseline Validation ROC-AUC"
          value={modelMetrics.baselineAuc.toFixed(6)}
          hint="0.791309"
        />
        <MetricCard
          label="Mean CV ROC-AUC"
          value={modelMetrics.meanCvAuc.toFixed(6)}
          hint="0.789452"
        />
        <MetricCard
          label="OOF ROC-AUC"
          value={modelMetrics.oofAuc.toFixed(6)}
          hint="0.789445"
        />
        <MetricCard
          label="Final Iterations"
          value={String(modelMetrics.finalIterations)}
          hint="Full-data CatBoost iterations."
        />
      </section>
    </PageShell>
  );
}
