import { useState } from "react";

import PageShell from "../components/common/PageShell";
import PageHero from "../components/common/PageHero";
import SectionHeading from "../components/common/SectionHeading";
import PredictionForm from "../components/prediction/PredictionForm";
import PredictionResult from "../components/prediction/PredictionResult";
import { predictionScenarioCards, predictionStudioNotes } from "../data/siteData";
import { predictRisk } from "../services/predictApi";

export default function PredictionStudioPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handlePredict = async (payload) => {
    setLoading(true);
    try {
      const prediction = await predictRisk(payload);
      setResult(prediction);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHero
        eyebrow="Prediction Studio"
        title="A compact frontend demo of the prediction contract the app would use with a real backend"
        description="The studio keeps the form small on purpose. It shows how the user experience works today in fallback mode while staying ready for a backend `/predict` service later."
      />

      <section className="mt-16 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionHeading
            eyebrow="Input"
            title="Enter representative applicant information"
            subtitle="The form focuses on the features that best explain burden, stability, and bureau activity in a recruiter-friendly demo."
          />
          <PredictionForm onPredict={handlePredict} loading={loading} />
        </div>

        <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div>
            <SectionHeading
              eyebrow="Output"
              title="Prediction result"
              subtitle="The panel below keeps the result shape stable across fallback and backend modes."
            />
            <PredictionResult result={result} />
          </div>

          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white">Studio Notes</h3>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              {predictionStudioNotes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <SectionHeading
          eyebrow="Scenario Design"
          title="Why the form is compact"
          subtitle="These cards explain the tradeoff between a clean demo and the much larger feature space used in the notebook pipeline."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {predictionScenarioCards.map((card) => (
            <div key={card.title} className="soft-card p-6">
              <h3 className="text-xl font-semibold text-white">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-slate-400">{card.text}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
