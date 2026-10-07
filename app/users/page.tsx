'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { usersApi, type User } from '@/lib/api'
import { useUsersStore } from '@/store/usersStore'
import { Plus, PencilSimple, Trash, CaretUp, CaretDown, CaretUpDown, X } from '@phosphor-icons/react'

type SortField = 'id' | 'name' | 'username' | 'email' | 'phone'
type SortDirection = 'asc' | 'desc' | null

export default function UsersPage() {
  const { users, isLoading, loadUsers, addUser, updateUser, deleteUser } = useUsersStore()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    website: '',
  })

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreate = () => {
    setEditingUser(null)
    setFormData({ name: '', username: '', email: '', phone: '', website: '' })
    setShowModal(true)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      website: user.website || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await usersApi.delete(id)
        deleteUser(id)
      } catch (error) {
        console.error('Failed to delete user:', error)
        alert('Failed to delete user')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingUser) {
        // Try API call, but update store regardless (since we use localStorage)
        try {
          await usersApi.update(editingUser.id, formData)
        } catch (apiError) {
          console.warn('API update failed, but updating local store:', apiError)
        }
        // Update store with form data - generate a temporary ID if needed
        updateUser(editingUser.id, {
          ...formData,
          id: editingUser.id, // Preserve the ID
        })
      } else {
        // For new users, try API but create locally if it fails
        try {
          const newUser = await usersApi.create(formData)
          addUser(newUser)
        } catch (apiError) {
          console.warn('API create failed, but creating locally:', apiError)
          // Create user locally with a temporary ID
          const maxId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0
          addUser({
            ...formData,
            id: maxId + 1,
          } as User)
        }
      }
      setShowModal(false)
    } catch (error) {
      console.error('Failed to save user:', error)
      alert('Failed to save user')
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') {
        setSortDirection('desc')
      } else if (sortDirection === 'desc') {
        setSortField(null)
        setSortDirection(null)
      } else {
        setSortDirection('asc')
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortField || !sortDirection) return 0

    let aValue: any = a[sortField]
    let bValue: any = b[sortField]

    if (sortField === 'id') {
      aValue = a.id
      bValue = b.id
    }

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0
    }
  })

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <CaretUpDown size={12} className="text-muted-foreground/60" />
    }
    if (sortDirection === 'asc') {
      return <CaretUp size={12} weight="bold" className="text-accent" />
    }
    if (sortDirection === 'desc') {
      return <CaretDown size={12} weight="bold" className="text-accent" />
    }
    return <CaretUpDown size={12} className="text-muted-foreground/60" />
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div data-testid="loading-users" className="text-lg text-muted-foreground">Loading users...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <button
            data-testid="add-user-button"
            onClick={handleCreate}
            className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg hover:brightness-110 active:brightness-95 transition-all text-sm font-medium shadow-glow cursor-pointer"
          >
            <Plus size={16} weight="bold" />
            Add User
          </button>
        </div>

        <Card className="overflow-hidden">
          <table data-testid="users-table" className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted select-none transition-colors"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-2">
                    ID
                    {getSortIcon('id')}
                  </div>
                </th>
                <th
                  data-testid="name-column-header"
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted select-none transition-colors"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {getSortIcon('name')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted select-none transition-colors"
                  onClick={() => handleSort('username')}
                >
                  <div className="flex items-center gap-2">
                    Username
                    {getSortIcon('username')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted select-none transition-colors"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {getSortIcon('email')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted select-none transition-colors"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center gap-2">
                    Phone
                    {getSortIcon('phone')}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground tabular">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {user.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        data-testid={`edit-user-${user.id}`}
                        onClick={() => handleEdit(user)}
                        aria-label={`Edit ${user.name}`}
                        className="text-muted-foreground hover:text-accent transition-colors cursor-pointer"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button
                        data-testid={`delete-user-${user.id}`}
                        onClick={() => handleDelete(user.id)}
                        aria-label={`Delete ${user.name}`}
                        className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

            {showModal && (
              <div data-testid="user-modal" className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <Card className="p-6 w-full max-w-md">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-xl font-semibold text-foreground">
                      {editingUser ? 'Edit User' : 'Create User'}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      aria-label="Close"
                      className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <form data-testid="user-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        data-testid="user-name-input"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-muted/40 focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground/70 transition-shadow"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                        Username
                      </label>
                      <input
                        type="text"
                        data-testid="user-username-input"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-muted/40 focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground/70 transition-shadow"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                        Email
                      </label>
                      <input
                        type="email"
                        data-testid="user-email-input"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-muted/40 focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground/70 transition-shadow"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                        Phone
                      </label>
                      <input
                        type="tel"
                        data-testid="user-phone-input"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-muted/40 focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground/70 transition-shadow"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-muted-foreground mb-1.5">
                        Website
                      </label>
                      <input
                        type="text"
                        data-testid="user-website-input"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData({ ...formData, website: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-lg bg-muted/40 focus:ring-2 focus:ring-accent focus:border-transparent text-foreground placeholder:text-muted-foreground/70 transition-shadow"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        data-testid="user-form-submit"
                        className="flex-1 bg-accent text-accent-foreground py-2 px-4 rounded-lg hover:brightness-110 active:brightness-95 transition-all font-medium shadow-glow cursor-pointer"
                      >
                        {editingUser ? 'Update' : 'Create'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="flex-1 bg-muted text-foreground py-2 px-4 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </Card>
              </div>
            )}
      </div>
    </Layout>
  )
}

