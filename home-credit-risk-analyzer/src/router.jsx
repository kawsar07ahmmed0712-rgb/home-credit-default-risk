/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";

const HomePage = lazy(() => import("./pages/HomePage"));
const DatasetOverviewPage = lazy(() => import("./pages/DatasetOverviewPage"));
const ColumnAuditExplorerPage = lazy(() => import("./pages/ColumnAuditExplorerPage"));
const VisualizationStudioPage = lazy(() => import("./pages/VisualizationStudioPage"));
const FeatureFamiliesPage = lazy(() => import("./pages/FeatureFamiliesPage"));
const EDAHighlightsPage = lazy(() => import("./pages/EDAHighlightsPage"));
const FeatureEngineeringSummaryPage = lazy(
  () => import("./pages/FeatureEngineeringSummaryPage")
);
const ModelPerformancePage = lazy(() => import("./pages/ModelPerformancePage"));
const MethodologyPage = lazy(() => import("./pages/MethodologyPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FuturePredictionStudioPage = lazy(
  () => import("./pages/FuturePredictionStudioPage")
);

function withSuspense(element) {
  return (
    <Suspense
      fallback={
        <div className="page-shell py-24">
          <div className="soft-card p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
              Loading
            </p>
            <h1 className="mt-3 text-2xl font-semibold text-white">
              Preparing the next page
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">
              The studio is loading the route module so navigation stays responsive.
            </p>
          </div>
        </div>
      }
    >
      {element}
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: withSuspense(<HomePage />) },
      { path: "dataset-overview", element: withSuspense(<DatasetOverviewPage />) },
      {
        path: "column-audit-explorer",
        element: withSuspense(<ColumnAuditExplorerPage />),
      },
      {
        path: "visualization-studio",
        element: withSuspense(<VisualizationStudioPage />),
      },
      { path: "feature-families", element: withSuspense(<FeatureFamiliesPage />) },
      { path: "eda-highlights", element: withSuspense(<EDAHighlightsPage />) },
      {
        path: "feature-engineering-summary",
        element: withSuspense(<FeatureEngineeringSummaryPage />),
      },
      { path: "model-performance", element: withSuspense(<ModelPerformancePage />) },
      { path: "methodology", element: withSuspense(<MethodologyPage />) },
      {
        path: "future-prediction-studio",
        element: withSuspense(<FuturePredictionStudioPage />),
      },
      { path: "about", element: withSuspense(<AboutPage />) },
      {
        path: "project-overview",
        element: <Navigate to="/dataset-overview" replace />,
      },
      {
        path: "structural-audit",
        element: <Navigate to="/column-audit-explorer" replace />,
      },
      {
        path: "feature-engineering",
        element: <Navigate to="/feature-engineering-summary" replace />,
      },
      {
        path: "prediction-studio",
        element: <Navigate to="/future-prediction-studio" replace />,
      },
      {
        path: "technical-details",
        element: <Navigate to="/methodology" replace />,
      },
      {
        path: "limitations",
        element: <Navigate to="/future-prediction-studio" replace />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
