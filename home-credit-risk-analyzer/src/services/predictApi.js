import { runRiskDemoEngine } from "../utils/riskDemoEngine";
import { clamp, riskLabelFromProbability } from "../utils/formatters";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function predictRisk(payload) {
  if (API_BASE_URL) {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Prediction API request failed.");
      }

      const data = await response.json();
      const probability = clamp(Number(data.probability), 0, 1);

      return {
        probability,
        label: data.label ?? riskLabelFromProbability(probability),
        drivers: Array.isArray(data.drivers) ? data.drivers : [],
        source: "backend-api",
      };
    } catch (error) {
      console.warn("API failed, using frontend fallback.", error);
    }
  }

  return runRiskDemoEngine(payload);
}
