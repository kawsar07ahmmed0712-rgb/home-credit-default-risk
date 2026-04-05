import { fallbackOverview } from "../data/fallbackStudioData";
import { apiRequest } from "./apiClient";

function queryString(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === false) return;
    search.set(key, value);
  });
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export async function getOverview() {
  try {
    return await apiRequest("/api/overview");
  } catch (error) {
    return { ...fallbackOverview, fallback: true, errorMessage: error.message };
  }
}

export async function getColumns(filters = {}) {
  return apiRequest(`/api/columns${queryString(filters)}`);
}

export async function getColumnReport(columnName) {
  return apiRequest(`/api/column-report/${encodeURIComponent(columnName)}`);
}

export async function getRelatedColumns(columnName) {
  return apiRequest(`/api/related-columns/${encodeURIComponent(columnName)}`);
}

export async function getFeatureFamilies() {
  try {
    return await apiRequest("/api/feature-families");
  } catch {
    return { feature_families: fallbackOverview.family_distribution };
  }
}

export async function getFeatureFamily(familyName) {
  try {
    return await apiRequest(`/api/feature-family/${encodeURIComponent(familyName)}`);
  } catch (error) {
    const fallback =
      fallbackOverview.family_distribution.find((item) => item.feature_family === familyName) ??
      fallbackOverview.family_distribution[0];
    return {
      ...fallback,
      columns: fallbackOverview.columns.filter((item) => item.feature_family === familyName),
      fallback: true,
      errorMessage: error.message,
    };
  }
}

export async function getUnivariatePlot(payload) {
  return apiRequest("/api/plot/univariate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getBivariatePlot(payload) {
  return apiRequest("/api/plot/bivariate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
