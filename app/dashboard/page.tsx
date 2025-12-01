'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { postsApi, todosApi } from '@/lib/api'
import { useUsersStore } from '@/store/usersStore'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export default function DashboardPage() {
  const { users, loadUsers } = useUsersStore()
  const [posts, setPosts] = useState<any[]>([])
  const [todos, setTodos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [postsData, todosData] = await Promise.all([
        postsApi.getAll(),
        todosApi.getAll(),
      ])
      setPosts(postsData)
      setTodos(todosData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate posts per user
  const postsPerUser = users.map((user) => {
    const userPosts = posts.filter((post) => post.userId === user.id)
    return {
      name: user.name.split(' ')[0], // First name only
      posts: userPosts.length,
    }
  })

  // Calculate todos completion
  const completedTodos = todos.filter((todo) => todo.completed).length
  const pendingTodos = todos.filter((todo) => !todo.completed).length
  const todosData = [
    { name: 'Completed', value: completedTodos },
    { name: 'Pending', value: pendingTodos },
  ]

  // Calculate todos per user
  const todosPerUser = users.slice(0, 5).map((user) => {
    const userTodos = todos.filter((todo) => todo.userId === user.id)
    return {
      name: user.name.split(' ')[0],
      completed: userTodos.filter((t) => t.completed).length,
      pending: userTodos.filter((t) => !t.completed).length,
    }
  })

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div data-testid="loading-dashboard" className="text-lg text-gray-600">Loading dashboard...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <h1 data-testid="dashboard-title" className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div data-testid="users-stat-card" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Users</h2>
            <p data-testid="users-count" className="text-3xl font-bold text-blue-600">{users.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total users</p>
          </div>
          <div data-testid="posts-stat-card" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Posts</h2>
            <p className="text-3xl font-bold text-green-600">{posts.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total posts</p>
          </div>
          <div data-testid="todos-stat-card" className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Todos</h2>
            <p className="text-3xl font-bold text-purple-600">{todos.length}</p>
            <p className="text-sm text-gray-500 mt-1">Total todos</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Posts per User Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 data-testid="posts-per-user-chart" className="text-xl font-semibold text-gray-800 mb-4">Posts per User</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={postsPerUser}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }}
                  labelStyle={{ color: '#111827' }}
                />
                <Legend />
                <Bar dataKey="posts" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Todos Completion Pie Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 data-testid="todos-completion-chart" className="text-xl font-semibold text-gray-800 mb-4">Todos Completion Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={todosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {todosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }}
                  labelStyle={{ color: '#111827' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Todos per User Stacked Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 data-testid="todos-status-by-user-chart" className="text-xl font-semibold text-gray-800 mb-4">Todos Status by User (Top 5)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={todosPerUser}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }} />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
              <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Posts Distribution Line Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 data-testid="posts-distribution-chart" className="text-xl font-semibold text-gray-800 mb-4">Posts Distribution by User</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={postsPerUser}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }} />
              <Legend />
              <Line type="monotone" dataKey="posts" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  )
}
