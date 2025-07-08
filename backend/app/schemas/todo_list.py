from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TodoListBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: Optional[str] = "#4CAF50"
    is_shared: Optional[bool] = False


class TodoListCreate(TodoListBase):
    pass


class TodoListUpdate(TodoListBase):
    name: Optional[str] = None


class TodoListResponse(TodoListBase):
    id: str
    owner_id: str
    task_count: int = 0
    completed_task_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
