"""AirFone API application factory."""

import logging

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.errors import ApiError, api_error_handler
from app.api.routes import admin, auth, feedback, me, plans
from app.core.config import get_settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.project_title,
        version=settings.project_version,
        description="Telecom self-service: plans, registration, recharge, billing, support, admin.",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_methods=["*"],
        allow_headers=["Authorization", "Content-Type"],
    )
    app.add_exception_handler(ApiError, api_error_handler)

    api = APIRouter(prefix="/api/v1")
    for module in (auth, plans, me, feedback, admin):
        api.include_router(module.router)
    app.include_router(api)

    @app.get("/health", tags=["meta"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
