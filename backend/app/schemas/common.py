from pydantic import BaseModel
from typing import Generic, TypeVar, List, Optional
from datetime import datetime

T = TypeVar('T')


class PaginationInfo(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool


class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    pagination: PaginationInfo


class ErrorResponse(BaseModel):
    error: str
    code: str
    details: Optional[dict] = None


class TokenResponse(BaseModel):
    token: str
    token_type: str = "bearer"


class MessageResponse(BaseModel):
    message: str
