import re

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator

from .. import database
from ..utils.security import rate_limit

router = APIRouter(prefix="/api/feedback", tags=["feedback"])
_CLEAN = re.compile(r"[\x00-\x1f\x7f<>]")


class FeedbackIn(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = ""

    @field_validator("comment")
    @classmethod
    def check_comment(cls, v: str) -> str:
        v = re.sub(r"\s+", " ", _CLEAN.sub(" ", v or "")).strip()
        if len(v.split()) > 30:
            raise ValueError("Comment must be 30 words or fewer.")
        if len(v) > 500:
            raise ValueError("Comment is too long.")
        return v


@router.post("", dependencies=[Depends(rate_limit("feedback", 5, 3600))])
def submit(body: FeedbackIn):
    database.add_feedback(body.rating, body.comment)
    return {"ok": True, "message": "Thank you for your feedback!"}


@router.get("/stats", dependencies=[Depends(rate_limit("feedback-stats", 60, 60))])
def stats():
    return database.get_stats()
