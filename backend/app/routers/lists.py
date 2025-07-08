from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.user import User
from app.models.todo_list import TodoList
from app.models.task import Task
from app.schemas.todo_list import TodoListCreate, TodoListUpdate, TodoListResponse
from app.schemas.common import PaginatedResponse, PaginationInfo
from app.auth import get_current_user
from app.config import settings

router = APIRouter(prefix="/lists", tags=["Lists"])


def get_paginated_lists(
    db: Session,
    user_id: str,
    page: int = 1,
    limit: int = settings.default_page_size,
    search: Optional[str] = None
) -> PaginatedResponse[TodoListResponse]:
    """Get paginated lists with optional search"""
    # Build query
    query = db.query(TodoList).filter(TodoList.owner_id == user_id)

    # Add search filter
    if search:
        query = query.filter(TodoList.name.ilike(f"%{search}%"))

    # Get total count
    total = query.count()

    # Apply pagination
    offset = (page - 1) * limit
    lists = query.offset(offset).limit(limit).all()

    # Calculate task counts for each list
    for todo_list in lists:
        task_count = db.query(func.count(Task.id)).filter(Task.list_id == todo_list.id).scalar()
        completed_count = db.query(func.count(Task.id)).filter(
            Task.list_id == todo_list.id, Task.is_completed == True
        ).scalar()
        todo_list.task_count = task_count
        todo_list.completed_task_count = completed_count

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

    return PaginatedResponse(data=lists, pagination=pagination_info)


@router.get("", response_model=PaginatedResponse[TodoListResponse])
def get_lists(
    page: int = Query(1, ge=1),
    limit: int = Query(settings.default_page_size, ge=1, le=settings.max_page_size),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's lists with pagination and search"""
    return get_paginated_lists(db, current_user.id, page, limit, search)


@router.post("", response_model=TodoListResponse, status_code=status.HTTP_201_CREATED)
def create_list(
    list_data: TodoListCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new list"""
    db_list = TodoList(
        **list_data.dict(),
        owner_id=current_user.id
    )

    db.add(db_list)
    db.commit()
    db.refresh(db_list)

    return db_list


@router.get("/{list_id}", response_model=TodoListResponse)
def get_list(
    list_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific list"""
    db_list = db.query(TodoList).filter(
        TodoList.id == list_id,
        TodoList.owner_id == current_user.id
    ).first()

    if not db_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    # Calculate task counts
    task_count = db.query(func.count(Task.id)).filter(Task.list_id == list_id).scalar()
    completed_count = db.query(func.count(Task.id)).filter(
        Task.list_id == list_id, Task.is_completed == True
    ).scalar()
    db_list.task_count = task_count
    db_list.completed_task_count = completed_count

    return db_list


@router.put("/{list_id}", response_model=TodoListResponse)
def update_list(
    list_id: str,
    list_data: TodoListUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a list"""
    db_list = db.query(TodoList).filter(
        TodoList.id == list_id,
        TodoList.owner_id == current_user.id
    ).first()

    if not db_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    # Update list fields
    update_data = list_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_list, field, value)

    db.commit()
    db.refresh(db_list)

    return db_list


@router.delete("/{list_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(
    list_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a list and all its tasks"""
    db_list = db.query(TodoList).filter(
        TodoList.id == list_id,
        TodoList.owner_id == current_user.id
    ).first()

    if not db_list:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="List not found"
        )

    db.delete(db_list)
    db.commit()
