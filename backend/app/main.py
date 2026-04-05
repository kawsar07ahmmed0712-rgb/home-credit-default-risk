from __future__ import annotations

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .analytics import (
    build_column_report,
    build_columns_list,
    build_feature_family_detail,
    build_overview,
    build_related_columns,
)
from .config import settings
from .plotting import build_bivariate_plot, build_univariate_plot

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin, "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/overview")
def overview() -> dict:
    return build_overview()


@app.get("/api/columns")
def columns(
    query: str = "",
    family: str | None = None,
    dtype: str | None = Query(default=None, pattern="^(numeric|categorical|boolean)?$"),
    missing_threshold: float | None = None,
    priority_only: bool = False,
    limit: int | None = Query(default=None, ge=1, le=200),
) -> list[dict]:
    return build_columns_list(
        query=query,
        family=family,
        dtype=dtype,
        missing_threshold=missing_threshold,
        priority_only=priority_only,
        limit=limit,
    )


@app.get("/api/column-report/{column_name}")
def column_report(column_name: str) -> dict:
    try:
        return build_column_report(column_name)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.get("/api/related-columns/{column_name}")
def related_columns(column_name: str) -> dict:
    try:
        return {"column": column_name, "related_columns": build_related_columns(column_name)}
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.get("/api/feature-family/{family_name}")
def feature_family(family_name: str) -> dict:
    try:
        return build_feature_family_detail(family_name)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error


@app.get("/api/feature-families")
def feature_families() -> dict:
    overview_payload = build_overview()
    return {"feature_families": overview_payload["family_distribution"]}


@app.post("/api/plot/univariate")
def plot_univariate(payload: dict) -> dict:
    try:
        return build_univariate_plot(payload)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post("/api/plot/bivariate")
def plot_bivariate(payload: dict) -> dict:
    try:
        return build_bivariate_plot(payload)
    except KeyError as error:
        raise HTTPException(status_code=404, detail=str(error)) from error
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error
