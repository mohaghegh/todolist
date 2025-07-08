'use client'

import React from 'react'
import Link from 'next/link'
import { TodoList } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { formatDate } from '@/lib/utils'

interface ListCardProps {
  list: TodoList
  onDelete: (id: string) => void
  onEdit: (list: TodoList) => void
}

export function ListCard({ list, onDelete, onEdit }: ListCardProps) {
  const completionRate = list.taskCount > 0
    ? Math.round((list.completedTaskCount / list.taskCount) * 100)
    : 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {list.name}
            </CardTitle>
            {list.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {list.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(list)}
              className="p-1"
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(list.id)}
              className="p-1 text-red-600 hover:text-red-700"
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-900 font-medium">
                {list.completedTaskCount}/{list.taskCount} tasks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">
              {completionRate}% complete
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">{list.completedTaskCount} done</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                <span className="text-gray-600">{list.taskCount - list.completedTaskCount} pending</span>
              </div>
            </div>
            <span className="text-gray-500 text-xs">
              Updated {formatDate(list.updatedAt)}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 pt-2">
            <Link href={`/lists/${list.id}`} className="flex-1">
              <Button className="w-full" size="sm">
                View Tasks
              </Button>
            </Link>
            <Link href={`/lists/${list.id}/add-task`}>
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <PlusIcon className="w-4 h-4" />
                <span>Add Task</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
