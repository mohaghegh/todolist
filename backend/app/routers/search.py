from typing import Optional, List
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from pydantic import BaseModel
from app.database import get_db
from app.models.user import User
from app.models.todo_list import TodoList
from app.models.task import Task
from app.models.category import Category
from app.schemas.todo_list import TodoListResponse
from app.schemas.task import TaskResponse
from app.schemas.common import PaginatedResponse, PaginationInfo
from app.auth import get_current_user
from app.config import settings

router = APIRouter(tags=["Search"])


class SearchResult(BaseModel):
    tasks: List[TaskResponse]
    lists: List[TodoListResponse]
    pagination: PaginationInfo


class AnalyticsResponse(BaseModel):
    total_tasks: int
    completed_tasks: int
    completion_rate: float
    total_lists: int
    tasks_by_priority: dict
    tasks_by_category: List[dict]
    recent_activity: List[dict]


@router.get("/search", response_model=SearchResult)
def search_tasks_and_lists(
    q: str = Query(..., description="Search query"),
    type: str = Query("all", description="Search type: tasks, lists, or all"),
    page: int = Query(1, ge=1),
    limit: int = Query(settings.default_page_size, ge=1, le=settings.max_page_size),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Search across tasks and lists"""
    tasks = []
    lists = []
    total_tasks = 0
    total_lists = 0

    # Search tasks
    if type in ["tasks", "all"]:
        task_query = db.query(Task).join(TodoList).filter(
            TodoList.owner_id == current_user.id,
            Task.title.ilike(f"%{q}%")
        )
        total_tasks = task_query.count()
        offset = (page - 1) * limit
        tasks = task_query.offset(offset).limit(limit).all()

    # Search lists
    if type in ["lists", "all"]:
        list_query = db.query(TodoList).filter(
            TodoList.owner_id == current_user.id,
            TodoList.name.ilike(f"%{q}%")
        )
        total_lists = list_query.count()
        offset = (page - 1) * limit
        lists = list_query.offset(offset).limit(limit).all()

    # Calculate pagination
    total = total_tasks + total_lists
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

    return SearchResult(
        tasks=tasks,
        lists=lists,
        pagination=pagination_info
    )


@router.get("/analytics", response_model=AnalyticsResponse)
def get_user_analytics(
    period: str = Query("month", description="Time period: week, month, year, all"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user analytics and statistics"""
    # Calculate date range
    now = datetime.utcnow()
    if period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:  # all
        start_date = None

    # Base queries
    task_query = db.query(Task).join(TodoList).filter(TodoList.owner_id == current_user.id)
    list_query = db.query(TodoList).filter(TodoList.owner_id == current_user.id)

    # Apply date filter if specified
    if start_date:
        task_query = task_query.filter(Task.created_at >= start_date)
        list_query = list_query.filter(TodoList.created_at >= start_date)

    # Get basic counts
    total_tasks = task_query.count()
    completed_tasks = task_query.filter(Task.is_completed == True).count()
    total_lists = list_query.count()

    # Calculate completion rate
    completion_rate = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # Tasks by priority
    priority_counts = {}
    for priority in ["low", "medium", "high", "urgent"]:
        count = task_query.filter(Task.priority == priority).count()
        priority_counts[priority] = count

    # Tasks by category
    category_stats = db.query(
        Category.name,
        Category.id,
        func.count(Task.id).label('count')
    ).join(Task).join(TodoList).filter(
        TodoList.owner_id == current_user.id
    ).group_by(Category.id, Category.name).all()

    tasks_by_category = [
        {
            "categoryId": str(cat.id),
            "categoryName": cat.name,
            "count": count
        }
        for cat, count in category_stats
    ]

    # Recent activity (last 10 activities)
    recent_activities = []

    # Recent task creations
    recent_tasks = task_query.order_by(Task.created_at.desc()).limit(5).all()
    for task in recent_tasks:
        recent_activities.append({
            "type": "task_created",
            "timestamp": task.created_at,
            "description": f"Created task: {task.title}"
        })

    # Recent task completions
    recent_completions = task_query.filter(
        Task.is_completed == True
    ).order_by(Task.completed_at.desc()).limit(5).all()

    for task in recent_completions:
        if task.completed_at:
            recent_activities.append({
                "type": "task_completed",
                "timestamp": task.completed_at,
                "description": f"Completed task: {task.title}"
            })

    # Recent list creations
    recent_lists = list_query.order_by(TodoList.created_at.desc()).limit(5).all()
    for todo_list in recent_lists:
        recent_activities.append({
            "type": "list_created",
            "timestamp": todo_list.created_at,
            "description": f"Created list: {todo_list.name}"
        })

    # Sort activities by timestamp and take top 10
    recent_activities.sort(key=lambda x: x["timestamp"], reverse=True)
    recent_activities = recent_activities[:10]

    return AnalyticsResponse(
        total_tasks=total_tasks,
        completed_tasks=completed_tasks,
        completion_rate=round(completion_rate, 2),
        total_lists=total_lists,
        tasks_by_priority=priority_counts,
        tasks_by_category=tasks_by_category,
        recent_activity=recent_activities
    )
