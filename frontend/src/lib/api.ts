import axios, { AxiosInstance } from 'axios'
import { API_BASE_URL } from './utils'
import {
  User,
  TodoList,
  Task,
  Category,
  CreateUserRequest,
  LoginRequest,
  CreateListRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  CreateCategoryRequest,
  PaginatedResponse,
  AuthResponse,
  Analytics
} from '@/types'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Authentication
  async register(data: CreateUserRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data)
    return response.data
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data)
    return response.data
  }

  async refreshToken(): Promise<{ token: string }> {
    const response = await this.client.post<{ token: string }>('/auth/refresh')
    return response.data
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout')
  }

  // User management
  async getCurrentUser(): Promise<User> {
    const response = await this.client.get<User>('/users/me')
    return response.data
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.client.put<User>('/users/me', data)
    return response.data
  }

  // Lists
  async getLists(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<PaginatedResponse<TodoList>> {
    const response = await this.client.get<PaginatedResponse<TodoList>>('/lists', { params })
    return response.data
  }

  async createList(data: CreateListRequest): Promise<TodoList> {
    const response = await this.client.post<TodoList>('/lists', data)
    return response.data
  }

  async getList(id: string): Promise<TodoList> {
    const response = await this.client.get<TodoList>(`/lists/${id}`)
    return response.data
  }

  async updateList(id: string, data: CreateListRequest): Promise<TodoList> {
    const response = await this.client.put<TodoList>(`/lists/${id}`, data)
    return response.data
  }

  async deleteList(id: string): Promise<void> {
    await this.client.delete(`/lists/${id}`)
  }

  // Tasks
  async getTasks(listId: string, params?: {
    page?: number
    limit?: number
    completed?: boolean
    priority?: string
    categoryId?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }): Promise<PaginatedResponse<Task>> {
    const response = await this.client.get<PaginatedResponse<Task>>(`/lists/${listId}/tasks`, { params })
    return response.data
  }

  async createTask(listId: string, data: CreateTaskRequest): Promise<Task> {
    const response = await this.client.post<Task>(`/lists/${listId}/tasks`, data)
    return response.data
  }

  async getTask(id: string): Promise<Task> {
    const response = await this.client.get<Task>(`/tasks/${id}`)
    return response.data
  }

  async updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
    const response = await this.client.put<Task>(`/tasks/${id}`, data)
    return response.data
  }

  async deleteTask(id: string): Promise<void> {
    await this.client.delete(`/tasks/${id}`)
  }

  async toggleTask(id: string): Promise<Task> {
    const response = await this.client.patch<Task>(`/tasks/${id}/toggle`)
    return response.data
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    const response = await this.client.get<Category[]>('/categories')
    return response.data
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await this.client.post<Category>('/categories', data)
    return response.data
  }

  async getCategory(id: string): Promise<Category> {
    const response = await this.client.get<Category>(`/categories/${id}`)
    return response.data
  }

  async updateCategory(id: string, data: CreateCategoryRequest): Promise<Category> {
    const response = await this.client.put<Category>(`/categories/${id}`, data)
    return response.data
  }

  async deleteCategory(id: string): Promise<void> {
    await this.client.delete(`/categories/${id}`)
  }

  // Search
  async search(params: {
    q: string
    type?: 'tasks' | 'lists' | 'all'
    page?: number
    limit?: number
  }): Promise<{
    tasks: Task[]
    lists: TodoList[]
    pagination: PaginatedResponse<unknown>['pagination']
  }> {
    const response = await this.client.get('/search', { params })
    return response.data
  }

  // Analytics
  async getAnalytics(params?: { period?: 'week' | 'month' | 'year' | 'all' }): Promise<Analytics> {
    const response = await this.client.get<Analytics>('/analytics', { params })
    return response.data
  }

  // Bulk operations
  async bulkCreateTasks(listId: string, tasks: CreateTaskRequest[]): Promise<Task[]> {
    const response = await this.client.post<Task[]>('/tasks/bulk', { listId, tasks })
    return response.data
  }

  async bulkUpdateTasks(taskIds: string[], updates: UpdateTaskRequest): Promise<Task[]> {
    const response = await this.client.patch<Task[]>('/tasks/bulk/update', { taskIds, updates })
    return response.data
  }

  async bulkDeleteTasks(taskIds: string[]): Promise<void> {
    await this.client.delete('/tasks/bulk/delete', { data: { taskIds } })
  }
}

export const api = new ApiClient()
