"""TEMPLATE for a new tool endpoint. Copy to e.g. `qr_code.py` (no leading underscore) and it is
registered automatically on the next backend start. Put heavy logic in app/services/<name>_service.py."""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..utils.security import rate_limit

router = APIRouter(prefix="/api", tags=["example"])


class EchoIn(BaseModel):
    text: str = Field(max_length=200)


@router.post("/example-echo", dependencies=[Depends(rate_limit("example", 30, 60))])
def echo(body: EchoIn):
    return {"echo": body.text}
