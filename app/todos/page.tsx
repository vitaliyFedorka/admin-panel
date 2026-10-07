'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { todosApi, type Todo } from '@/lib/api'
import { CaretUp, CaretDown, CaretUpDown, CheckCircle, Circle } from '@phosphor-icons/react'

type SortField = 'id' | 'title' | 'userId' | 'completed'
type SortDirection = 'asc' | 'desc' | null

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all')
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(null)

  useEffect(() => {
    loadTodos()
  }, [])

  const loadTodos = async () => {
    try {
      setLoading(true)
      const data = await todosApi.getAll()
      setTodos(data)
    } catch (error) {
      console.error('Failed to load todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'completed') return todo.completed
    if (filter === 'pending') return !todo.completed
    return true
  })

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

  const sortedTodos = [...filteredTodos].sort((a, b) => {
    if (!sortField || !sortDirection) return 0

    let aValue: any
    let bValue: any

    if (sortField === 'id') {
      aValue = a.id
      bValue = b.id
    } else if (sortField === 'title') {
      aValue = a.title.toLowerCase()
      bValue = b.title.toLowerCase()
    } else if (sortField === 'userId') {
      aValue = a.userId
      bValue = b.userId
    } else if (sortField === 'completed') {
      aValue = a.completed ? 1 : 0
      bValue = b.completed ? 1 : 0
    }

    if (aValue === null || aValue === undefined) return 1
    if (bValue === null || bValue === undefined) return -1

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

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading todos...</div>
        </div>
      </Layout>
    )
  }

  const filters: Array<{ value: typeof filter; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
  ]

  return (
    <Layout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-foreground">Todos</h1>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  filter === f.value
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden">
          <table className="min-w-full divide-y divide-border">
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
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted select-none transition-colors"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-2">
                    Title
                    {getSortIcon('title')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted select-none transition-colors"
                  onClick={() => handleSort('userId')}
                >
                  <div className="flex items-center gap-2">
                    User ID
                    {getSortIcon('userId')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted select-none transition-colors"
                  onClick={() => handleSort('completed')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon('completed')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sortedTodos.map((todo) => (
                <tr key={todo.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground tabular">
                    {todo.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">{todo.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground tabular">
                    {todo.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                        todo.completed
                          ? 'bg-accent/10 text-accent'
                          : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {todo.completed ? <CheckCircle size={13} weight="fill" /> : <Circle size={13} weight="fill" />}
                      {todo.completed ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {sortedTodos.length} of {todos.length} todos
        </div>
      </div>
    </Layout>
  )
}

