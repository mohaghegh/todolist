from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "medium"  # low, medium, high, urgent
    due_date: Optional[datetime] = None
    category_id: Optional[str] = None
    tags: Optional[List[str]] = []


class TaskCreate(TaskBase):
    pass


class TaskUpdate(TaskBase):
    title: Optional[str] = None
    is_completed: Optional[bool] = None


class TaskResponse(TaskBase):
    id: str
    list_id: str
    is_completed: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BulkTaskCreate(BaseModel):
    list_id: str
    tasks: List[TaskCreate]


class BulkTaskUpdate(BaseModel):
    task_ids: List[str]
    updates: TaskUpdate


class BulkTaskDelete(BaseModel):
    task_ids: List[str]
