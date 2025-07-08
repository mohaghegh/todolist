from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import uuid


class TodoList(Base):
    __tablename__ = "todo_lists"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(String)
    color = Column(String, default="#4CAF50")
    is_shared = Column(Boolean, default=False)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="lists")
    tasks = relationship("Task", back_populates="list", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<TodoList(id={self.id}, name={self.name}, owner_id={self.owner_id})>"
