from fastapi import APIRouter

from app.api.deps import DbSession
from app.api.errors import ApiError
from app.models import PlanCategory
from app.schemas import PlanRead
from app.services import billing

router = APIRouter(prefix="/plans", tags=["plans"])


@router.get("", response_model=list[PlanRead])
def list_plans(db: DbSession, category: PlanCategory | None = None) -> list[PlanRead]:
    return [PlanRead.model_validate(p) for p in billing.list_plans(db, category)]


@router.get("/{plan_id}", response_model=PlanRead)
def get_plan(plan_id: int, db: DbSession) -> PlanRead:
    plan = billing.get_plan(db, plan_id)
    if plan is None:
        raise ApiError(404, "Plan not found.")
    return PlanRead.model_validate(plan)
