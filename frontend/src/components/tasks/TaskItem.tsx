'use client'

import React from 'react'
import { Task } from '@/types'
import { Button } from '@/components/ui/Button'
import {
  TrashIcon,
  PencilIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { getPriorityColor, getPriorityIcon, formatDate } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.isCompleted

  return (
    <div className={`group flex items-start space-x-3 p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-all ${
      task.isCompleted ? 'bg-gray-50' : 'bg-white'
    }`}>
      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        className={`flex-shrink-0 mt-1 w-5 h-5 rounded border-2 transition-colors ${
          task.isCompleted
            ? 'bg-blue-600 border-blue-600'
            : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        {task.isCompleted && (
          <CheckCircleIcon className="w-4 h-4 text-white" />
        )}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className={`text-sm font-medium ${
              task.isCompleted
                ? 'text-gray-500 line-through'
                : 'text-gray-900'
            }`}>
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-sm mt-1 ${
                task.isCompleted ? 'text-gray-400' : 'text-gray-600'
              }`}>
                {task.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="p-1"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="p-1 text-red-600 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Task Meta */}
        <div className="flex items-center space-x-3 mt-2">
          {/* Priority */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            <span className="mr-1">{getPriorityIcon(task.priority)}</span>
            {task.priority}
          </span>

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center space-x-1 text-xs ${
              isOverdue ? 'text-red-600' : 'text-gray-500'
            }`}>
              <ClockIcon className="w-3 h-3" />
              <span>
                {isOverdue ? 'Overdue' : 'Due'} {formatDate(task.dueDate)}
              </span>
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              {task.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{task.tags.length - 2} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Completion Info */}
        {task.isCompleted && task.completedAt && (
          <div className="mt-2 text-xs text-gray-500">
            Completed {formatDate(task.completedAt)}
          </div>
        )}
      </div>
    </div>
  )
}
