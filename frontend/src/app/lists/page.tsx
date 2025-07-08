'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { TodoList } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ListCard } from '@/components/lists/ListCard'
import Link from 'next/link'
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function ListsPage() {
  const { user } = useAuth()
  const [lists, setLists] = useState<TodoList[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true)
      const response = await api.getLists({
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined
      })

      if (currentPage === 1) {
        setLists(response.data)
      } else {
        setLists(prev => [...prev, ...response.data])
      }

      setHasMore(response.pagination.hasNext)
    } catch (error) {
      console.error('Error fetching lists:', error)
    } finally {
      setLoading(false)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    if (user) {
      fetchLists()
    }
  }, [user, fetchLists])

  const handleDelete = async (id: string) => {
    try {
      await api.deleteList(id)
      setLists(prev => prev.filter(list => list.id !== id))
    } catch (error) {
      console.error('Error deleting list:', error)
    }
  }

  const handleEdit = (list: TodoList) => {
    // TODO: Implement edit functionality
    console.log('Edit list:', list)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
  }

  const loadMore = () => {
    setCurrentPage(prev => prev + 1)
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your lists</h1>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Lists</h1>
            <p className="mt-2 text-gray-600">
              Organize your tasks into lists and track your progress
            </p>
          </div>
          <Link href="/lists/new">
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Create List
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search lists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button type="submit" variant="outline">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lists Grid */}
      {loading && currentPage === 1 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : lists.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="mt-8 text-center">
              <Button
                variant="outline"
                onClick={loadMore}
                loading={loading}
              >
                Load More Lists
              </Button>
            </div>
          )}
        </>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lists found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? `No lists match "${searchTerm}". Try a different search term.`
                : "Get started by creating your first list to organize your tasks."
              }
            </p>
            <Link href="/lists/new">
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First List
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
