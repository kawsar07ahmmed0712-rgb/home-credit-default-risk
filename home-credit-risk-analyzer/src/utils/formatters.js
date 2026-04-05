export function clamp(value, min, max) {
  if (Number.isNaN(Number(value))) return min;
  return Math.min(Math.max(Number(value), min), max);
}

export function formatPercent(value, digits = 1) {
  return `${(clamp(value, 0, 1) * 100).toFixed(digits)}%`;
}

export function formatDecimal(value, digits = 4) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "0.0000";
  return numeric.toFixed(digits);
}

export function formatSignedDecimal(value, digits = 4) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "0.0000";
  return numeric > 0 ? `+${numeric.toFixed(digits)}` : numeric.toFixed(digits);
}

export function riskLabelFromProbability(probability) {
  const score = clamp(probability, 0, 1);

  if (score >= 0.45) return "High default risk";
  if (score >= 0.2) return "Moderate default risk";
  return "Lower default risk";
}

export function riskColorFromProbability(probability) {
  const score = clamp(probability, 0, 1);

  if (score >= 0.45) return "bg-rose-500";
  if (score >= 0.2) return "bg-amber-400";
  return "bg-emerald-400";
}
