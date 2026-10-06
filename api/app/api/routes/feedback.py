from fastapi import APIRouter, status

from app.api.deps import DbSession, OptionalCustomer
from app.schemas import FeedbackCreate, FeedbackRead
from app.services import support

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackRead, status_code=status.HTTP_201_CREATED)
def give_feedback(data: FeedbackCreate, db: DbSession, customer: OptionalCustomer):
    """Anyone can leave feedback; it's linked to the account when signed in."""
    return FeedbackRead.model_validate(support.create_feedback(db, data, customer))
