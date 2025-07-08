from typing import Optional, List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.database import get_db
from app.models.user import User
from app.models.todo_list import TodoList
from app.models.task import Task
from app.models.category import Category
from app.schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, BulkTaskCreate,
    BulkTaskUpdate, BulkTaskDelete
)
from app.schemas.common import PaginatedResponse, PaginationInfo
from app.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/tasks", tags=["Tasks"])


def get_paginated_tasks(
    db: Session,
    list_id: str,
    page: int = 1,
    limit: int = settings.default_page_size,
    completed: Optional[bool] = None,
    priority: Optional[str] = None,
    category_id: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "createdAt",
    sort_order: str = "desc"
) -> PaginatedResponse[TaskResponse]:
    """Get paginated tasks with filtering and sorting"""
    # Build query
    query = db.query(Task).filter(Task.list_id == list_id)

    # Add filters
    if completed is not None:
        query = query.filter(Task.is_completed == completed)

    if priority:
        query = query.filter(Task.priority == priority)

    if category_id:
        query = query.filter(Task.category_id == category_id)

    if search:
        query = query.filter(Task.title.ilike(f"%{search}%"))

    # Add sorting
    sort_field_map = {
        "createdAt": Task.created_at,
        "updatedAt": Task.updated_at,
        "dueDate": Task.due_date,
        "priority": Task.priority,
        "title": Task.title
    }

    sort_field = sort_field_map.get(sort_by, Task.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_field.asc())
    else:
        query = query.order_by(sort_field.desc())

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * limit
    tasks = query.offset(offset).limit(limit).all()

    # Calculate pagination info
    total_pages = (total + limit - 1) // limit
    has_next = page < total_pages
    has_prev = page > 1

    pagination_info = PaginationInfo(
        page=page,
        limit=limit,
        total=total,
        total_pages=total_pages,
        has_next=has_next,
        has_prev=has_prev
    )

    return PaginatedResponse(data=tasks, pagination=pagination_info)


@router.get("/{list_id}/tasks", response_model=PaginatedResponse[TaskResponse])
def get_tasks(
    list_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(settings.default_page_size, ge=1, le=settings.max_page_size),
    completed: Optional[bool] = Query(None),
    priority: Optional[str] = Query(None),
    category_id: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    sort_by: str = Query("createdAt"),
    sort_order: str = Query("desc"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get tasks in a list with filtering and sorting"""
    # Verify list ownership
    list_exists = db.query(TodoList).filter(
        TodoList.id == list_id,
        TodoList.owner_id == current_user.id
    ).first()

    if not list_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    return get_paginated_tasks(
        db, list_id, page, limit, completed, priority, category_id, search, sort_by, sort_order
    )


@router.post("/{list_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    list_id: str,
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task in a list"""
    # Verify list ownership
    list_exists = db.query(TodoList).filter(
        TodoList.id == list_id,
        TodoList.owner_id == current_user.id
    ).first()

    if not list_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    # Verify category ownership if provided
    if task_data.category_id:
        category_exists = db.query(Category).filter(
            Category.id == task_data.category_id,
            Category.user_id == current_user.id
        ).first()

        if not category_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

    db_task = Task(
        **task_data.dict(),
        list_id=list_id
    )

    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    return db_task


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific task"""
    db_task = db.query(Task).join(TodoList).filter(
        Task.id == task_id,
        TodoList.owner_id == current_user.id
    ).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return db_task


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: str,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a task"""
    db_task = db.query(Task).join(TodoList).filter(
        Task.id == task_id,
        TodoList.owner_id == current_user.id
    ).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Verify category ownership if being updated
    if task_data.category_id and task_data.category_id != db_task.category_id:
        category_exists = db.query(Category).filter(
            Category.id == task_data.category_id,
            Category.user_id == current_user.id
        ).first()

        if not category_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

    # Update task fields
    update_data = task_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_task, field, value)

    # Update completion timestamp
    if task_data.is_completed is not None:
        if task_data.is_completed and not db_task.is_completed:
            db_task.completed_at = datetime.utcnow()
        elif not task_data.is_completed:
            db_task.completed_at = None

    db.commit()
    db.refresh(db_task)

    return db_task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a task"""
    db_task = db.query(Task).join(TodoList).filter(
        Task.id == task_id,
        TodoList.owner_id == current_user.id
    ).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    db.delete(db_task)
    db.commit()


@router.patch("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task_completion(
    task_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle task completion status"""
    db_task = db.query(Task).join(TodoList).filter(
        Task.id == task_id,
        TodoList.owner_id == current_user.id
    ).first()

    if not db_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completion status
    db_task.is_completed = not db_task.is_completed

    if db_task.is_completed:
        db_task.completed_at = datetime.utcnow()
    else:
        db_task.completed_at = None

    db.commit()
    db.refresh(db_task)

    return db_task


# Bulk operations
@router.post("/bulk", response_model=List[TaskResponse], status_code=status.HTTP_201_CREATED)
def bulk_create_tasks(
    bulk_data: BulkTaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create multiple tasks at once"""
    # Verify list ownership
    list_exists = db.query(TodoList).filter(
        TodoList.id == bulk_data.list_id,
        TodoList.owner_id == current_user.id
    ).first()

    if not list_exists:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    created_tasks = []
    for task_data in bulk_data.tasks:
        # Verify category ownership if provided
        if task_data.category_id:
            category_exists = db.query(Category).filter(
                Category.id == task_data.category_id,
                Category.user_id == current_user.id
            ).first()

            if not category_exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Category {task_data.category_id} not found"
                )

        db_task = Task(
            **task_data.dict(),
            list_id=bulk_data.list_id
        )
        db.add(db_task)
        created_tasks.append(db_task)

    db.commit()

    # Refresh all created tasks
    for task in created_tasks:
        db.refresh(task)

    return created_tasks


@router.patch("/bulk/update", response_model=List[TaskResponse])
def bulk_update_tasks(
    bulk_data: BulkTaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update multiple tasks at once"""
    # Get tasks that belong to user's lists
    tasks = db.query(Task).join(TodoList).filter(
        Task.id.in_(bulk_data.task_ids),
        TodoList.owner_id == current_user.id
    ).all()

    if len(tasks) != len(bulk_data.task_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Some tasks not found or not accessible"
        )

    # Verify category ownership if being updated
    if bulk_data.updates.category_id:
        category_exists = db.query(Category).filter(
            Category.id == bulk_data.updates.category_id,
            Category.user_id == current_user.id
        ).first()

        if not category_exists:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Category not found"
            )

    # Update all tasks
    update_data = bulk_data.updates.dict(exclude_unset=True)
    for task in tasks:
        for field, value in update_data.items():
            setattr(task, field, value)

        # Update completion timestamp
        if bulk_data.updates.is_completed is not None:
            if bulk_data.updates.is_completed and not task.is_completed:
                task.completed_at = datetime.utcnow()
            elif not bulk_data.updates.is_completed:
                task.completed_at = None

    db.commit()

    # Refresh all updated tasks
    for task in tasks:
        db.refresh(task)

    return tasks


@router.delete("/bulk/delete", status_code=status.HTTP_204_NO_CONTENT)
def bulk_delete_tasks(
    bulk_data: BulkTaskDelete,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete multiple tasks at once"""
    # Get tasks that belong to user's lists
    tasks = db.query(Task).join(TodoList).filter(
        Task.id.in_(bulk_data.task_ids),
        TodoList.owner_id == current_user.id
    ).all()

    if len(tasks) != len(bulk_data.task_ids):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Some tasks not found or not accessible"
        )

    # Delete all tasks
    for task in tasks:
        db.delete(task)

    db.commit()
