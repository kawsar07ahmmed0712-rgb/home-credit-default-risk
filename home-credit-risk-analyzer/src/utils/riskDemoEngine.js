import { clamp, riskLabelFromProbability } from "./formatters";

const normalize = (value, min, max) => clamp((value - min) / (max - min), 0, 1);

export function runRiskDemoEngine(input) {
  const income = Number(input.incomeTotal || 0);
  const credit = Number(input.creditAmount || 0);
  const annuity = Number(input.annuityAmount || 0);
  const goodsPrice = Number(input.goodsPrice || 0);
  const ageYears = Number(input.ageYears || 0);
  const employedYears = Number(input.employedYears || 0);
  const phoneChangeYears = Number(input.phoneChangeYears || 0);
  const familyMembers = Number(input.familyMembers || 1);
  const children = Number(input.children || 0);
  const bureauReqYear = Number(input.bureauReqYear || 0);
  const socialObs30 = Number(input.socialObs30 || 0);
  const socialDef30 = Number(input.socialDef30 || 0);
  const totalArea = Number(input.totalArea || 0);

  const annuityIncomeRatio = annuity / Math.max(income, 1);
  const creditIncomeRatio = credit / Math.max(income, 1);
  const goodsCreditGap = Math.abs(credit - goodsPrice) / Math.max(credit, 1);

  let score = 0.08;

  score += normalize(annuityIncomeRatio, 0.05, 0.35) * 0.28;
  score += normalize(creditIncomeRatio, 1, 8) * 0.19;
  score += normalize(bureauReqYear, 0, 10) * 0.08;
  score += normalize(socialObs30 + socialDef30, 0, 8) * 0.06;
  score += normalize(children, 0, 4) * 0.03;
  score += normalize(goodsCreditGap, 0, 0.4) * 0.04;

  score -= normalize(income, 60000, 500000) * 0.12;
  score -= normalize(ageYears, 21, 60) * 0.07;
  score -= normalize(employedYears, 0, 15) * 0.06;
  score -= normalize(phoneChangeYears, 0, 10) * 0.02;
  score -= normalize(totalArea, 30, 250) * 0.02;
  score -= normalize(familyMembers, 1, 6) * 0.01;

  if (input.educationType === "Higher education") score -= 0.03;
  if (input.incomeType === "Pensioner") score -= 0.02;
  if (input.housingType === "House / apartment") score -= 0.015;
  if (input.occupationType === "Unemployed") score += 0.05;
  if (input.incomeType === "Unemployed") score += 0.06;

  const probability = clamp(score, 0.02, 0.95);
  const label = riskLabelFromProbability(probability);

  const drivers = [
    {
      label: "Annuity-to-income",
      value: `${(annuityIncomeRatio * 100).toFixed(1)}%`,
    },
    {
      label: "Credit-to-income",
      value: `${creditIncomeRatio.toFixed(2)}x`,
    },
    {
      label: "Employment length",
      value: `${employedYears.toFixed(1)} years`,
    },
    {
      label: "Bureau requests",
      value: `${bureauReqYear} in last year`,
    },
    {
      label: "Phone stability",
      value: `${phoneChangeYears.toFixed(1)} years since change`,
    },
  ];

  return {
    probability,
    label,
    drivers,
    source: "frontend-demo-engine",
  };
}
