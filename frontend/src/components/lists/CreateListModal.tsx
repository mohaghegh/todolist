'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { api } from '@/lib/api'
import { CreateListRequest } from '@/types'
import { XMarkIcon } from '@heroicons/react/24/outline'

const createListSchema = z.object({
  name: z.string().min(1, 'List name is required').max(100, 'List name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format').optional(),
})

type CreateListFormData = z.infer<typeof createListSchema>

interface CreateListModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const colorOptions = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // yellow
  '#EF4444', // red
  '#8B5CF6', // purple
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
]

export function CreateListModal({ isOpen, onClose, onSuccess }: CreateListModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedColor, setSelectedColor] = useState(colorOptions[0])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateListFormData>({
    resolver: zodResolver(createListSchema),
  })

  const onSubmit = async (data: CreateListFormData) => {
    try {
      setLoading(true)
      const listData: CreateListRequest = {
        ...data,
        color: selectedColor,
      }
      await api.createList(listData)
      reset()
      setSelectedColor(colorOptions[0])
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating list:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Create New List</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <Input
            label="List Name"
            placeholder="Enter list name"
            error={errors.name?.message}
            {...register('name')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              {...register('description')}
              placeholder="Enter list description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="submit"
              className="flex-1"
              loading={loading}
            >
              Create List
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
