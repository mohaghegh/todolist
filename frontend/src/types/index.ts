export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  createdAt: string
  updatedAt: string
}

export interface TodoList {
  id: string
  name: string
  description?: string
  color?: string
  isShared: boolean
  ownerId: string
  createdAt: string
  updatedAt: string
  taskCount: number
  completedTaskCount: number
}

export interface Task {
  id: string
  title: string
  description?: string
  isCompleted: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  listId: string
  categoryId?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  completedAt?: string
}

export interface Category {
  id: string
  name: string
  color?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CreateListRequest {
  name: string
  description?: string
  color?: string
  isShared?: boolean
}

export interface CreateTaskRequest {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  categoryId?: string
  tags?: string[]
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  isCompleted?: boolean
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  categoryId?: string
  tags?: string[]
}

export interface CreateCategoryRequest {
  name: string
  color?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ErrorResponse {
  error: string
  code: string
  details?: unknown
}

export interface Analytics {
  totalTasks: number
  completedTasks: number
  completionRate: number
  totalLists: number
  tasksByPriority: {
    low: number
    medium: number
    high: number
    urgent: number
  }
  tasksByCategory: Array<{
    categoryId: string
    categoryName: string
    count: number
  }>
  recentActivity: Array<{
    type: 'task_created' | 'task_completed' | 'list_created'
    timestamp: string
    description: string
  }>
}
