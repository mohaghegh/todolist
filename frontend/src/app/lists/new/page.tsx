'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { CreateListModal } from '@/components/lists/CreateListModal'

export default function NewListPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isModalOpen] = useState(true)

  const handleSuccess = () => {
    router.push('/lists')
  }

  const handleClose = () => {
    router.push('/lists')
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to create lists</h1>
        </div>
      </div>
    )
  }

  return (
    <CreateListModal
      isOpen={isModalOpen}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  )
}
