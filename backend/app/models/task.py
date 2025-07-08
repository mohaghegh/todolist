from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Text, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    description = Column(Text)
    is_completed = Column(Boolean, default=False)
    priority = Column(String, default="medium")  # low, medium, high, urgent
    due_date = Column(DateTime(timezone=True))
    list_id = Column(String, ForeignKey("todo_lists.id"), nullable=False)
    category_id = Column(String, ForeignKey("categories.id"))
    tags = Column(ARRAY(String), default=[])
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))

    # Relationships
    list = relationship("TodoList", back_populates="tasks")
    category = relationship("Category", back_populates="tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, title={self.title}, list_id={self.list_id})>"
