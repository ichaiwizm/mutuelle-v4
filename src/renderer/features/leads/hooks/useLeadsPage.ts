import { useState } from 'react'
import type { LeadWithMeta } from '../types'

export function useLeadsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLead, setSelectedLead] = useState<LeadWithMeta | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<LeadWithMeta | null>(null)
  const [deletingLead, setDeletingLead] = useState<LeadWithMeta | null>(null)

  const handleView = (lead: LeadWithMeta) => setSelectedLead(lead)

  const handleEdit = (lead: LeadWithMeta) => {
    setEditingLead(lead)
    setIsFormOpen(true)
  }

  const handleEditFromDetails = (lead: LeadWithMeta) => {
    setSelectedLead(null)
    setEditingLead(lead)
    setIsFormOpen(true)
  }

  const handleDelete = (lead: LeadWithMeta) => setDeletingLead(lead)

  const handleCreate = () => {
    setEditingLead(null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingLead(null)
  }

  const handleCloseDetails = () => setSelectedLead(null)
  const handleCloseDelete = () => setDeletingLead(null)

  return {
    searchQuery,
    setSearchQuery,
    selectedLead,
    isFormOpen,
    editingLead,
    deletingLead,
    handlers: {
      view: handleView,
      edit: handleEdit,
      editFromDetails: handleEditFromDetails,
      delete: handleDelete,
      create: handleCreate,
      closeForm: handleCloseForm,
      closeDetails: handleCloseDetails,
      closeDelete: handleCloseDelete,
    },
  }
}
