'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { TodoList, Task } from '@/types'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { TaskItem } from '@/components/tasks/TaskItem'
import Link from 'next/link'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

export default function ListDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const listId = params.id as string

  const [list, setList] = useState<TodoList | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCompleted, setFilterCompleted] = useState<boolean | null>(null)
  const [filterPriority, setFilterPriority] = useState<string>('')

  const fetchListAndTasks = useCallback(async () => {
    try {
      setLoading(true)
      const [listData, tasksResponse] = await Promise.all([
        api.getList(listId),
        api.getTasks(listId, {
          search: searchTerm || undefined,
          completed: filterCompleted !== null ? filterCompleted : undefined,
          priority: filterPriority || undefined,
        })
      ])
      setList(listData)
      setTasks(tasksResponse.data)
    } catch (error) {
      console.error('Error fetching list and tasks:', error)
      router.push('/lists')
    } finally {
      setLoading(false)
    }
  }, [listId, searchTerm, filterCompleted, filterPriority, router])

  useEffect(() => {
    if (user && listId) {
      fetchListAndTasks()
    }
  }, [user, listId, fetchListAndTasks])

  const handleToggleTask = async (taskId: string) => {
    try {
      const updatedTask = await api.toggleTask(taskId)
      setTasks(prev => prev.map(task =>
        task.id === taskId ? updatedTask : task
      ))
      // Refresh list to update task counts
      const updatedList = await api.getList(listId)
      setList(updatedList)
    } catch (error) {
      console.error('Error toggling task:', error)
    }
  }

  const handleEditTask = (task: Task) => {
    // TODO: Implement edit task functionality
    console.log('Edit task:', task)
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId)
      setTasks(prev => prev.filter(task => task.id !== taskId))
      // Refresh list to update task counts
      const updatedList = await api.getList(listId)
      setList(updatedList)
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">List not found</h1>
          <Link href="/lists">
            <Button>Back to Lists</Button>
          </Link>
        </div>
      </div>
    )
  }

  const completedTasks = tasks.filter(task => task.isCompleted)
  const pendingTasks = tasks.filter(task => !task.isCompleted)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link href="/lists">
            <Button variant="ghost" size="sm">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Lists
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
            {list.description && (
              <p className="mt-2 text-gray-600">{list.description}</p>
            )}
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
              <span>{list.taskCount} total tasks</span>
              <span>{list.completedTaskCount} completed</span>
              <span>{list.taskCount - list.completedTaskCount} pending</span>
            </div>
          </div>
          <Link href={`/lists/${listId}/add-task`}>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" variant="outline">
                <MagnifyingGlassIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <select
                  value={filterCompleted === null ? '' : filterCompleted.toString()}
                  onChange={(e) => setFilterCompleted(e.target.value === '' ? null : e.target.value === 'true')}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="false">Pending</option>
                  <option value="true">Completed</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Priority:</span>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tasks */}
      <div className="space-y-6">
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Tasks</h2>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Completed Tasks</h2>
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PlusIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filterCompleted !== null || filterPriority
                  ? 'No tasks match your current filters. Try adjusting your search criteria.'
                  : 'Get started by adding your first task to this list.'
                }
              </p>
              <Link href={`/lists/${listId}/add-task`}>
                <Button>
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Your First Task
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
