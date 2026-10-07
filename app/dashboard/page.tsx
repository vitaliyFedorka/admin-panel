'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { postsApi, todosApi } from '@/lib/api'
import { useUsersStore } from '@/store/usersStore'
import { Users as UsersIcon, Notebook, CheckSquare } from '@phosphor-icons/react'
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

const CHART_COLORS = {
  accent: '#22c55e',
  info: '#60a5fa',
  warning: '#fbbf24',
  grid: 'rgb(148 163 184 / 0.15)',
  axis: '#94a3b8',
}

const chartTooltipStyle = {
  contentStyle: {
    backgroundColor: 'rgb(17 25 43)',
    border: '1px solid rgb(148 163 184 / 0.2)',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '13px',
  },
  labelStyle: { color: '#f1f5f9' },
  itemStyle: { color: '#f1f5f9' },
}

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
          <div data-testid="loading-dashboard" className="text-lg text-muted-foreground">Loading dashboard...</div>
        </div>
      </Layout>
    )
  }

  const stats: Array<{
    testId: string
    label: string
    value: number
    sub: string
    icon: typeof UsersIcon
    countTestId?: string
  }> = [
    { testId: 'users-stat-card', label: 'Users', value: users.length, sub: 'Total users', icon: UsersIcon, countTestId: 'users-count' },
    { testId: 'posts-stat-card', label: 'Posts', value: posts.length, sub: 'Total posts', icon: Notebook },
    { testId: 'todos-stat-card', label: 'Todos', value: todos.length, sub: 'Total todos', icon: CheckSquare },
  ]

  return (
    <Layout>
      <div>
        <h1 data-testid="dashboard-title" className="text-2xl font-semibold text-foreground mb-6">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.testId} data-testid={stat.testId} className="p-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-sm font-medium text-muted-foreground">{stat.label}</h2>
                  <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Icon size={18} className="text-accent" />
                  </div>
                </div>
                <p
                  data-testid={stat.countTestId}
                  className="text-3xl font-semibold text-foreground tabular mt-3"
                >
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-1">{stat.sub}</p>
              </Card>
            )
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          {/* Posts per User Bar Chart */}
          <Card className="p-6">
            <h2 data-testid="posts-per-user-chart" className="text-base font-semibold text-foreground mb-4">Posts per User</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={postsPerUser}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis dataKey="name" stroke={CHART_COLORS.axis} fontSize={12} />
                <YAxis stroke={CHART_COLORS.axis} fontSize={12} />
                <Tooltip {...chartTooltipStyle} />
                <Legend />
                <Bar dataKey="posts" fill={CHART_COLORS.info} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Todos Completion Pie Chart */}
          <Card className="p-6">
            <h2 data-testid="todos-completion-chart" className="text-base font-semibold text-foreground mb-4">Todos Completion Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={todosData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {todosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? CHART_COLORS.accent : CHART_COLORS.warning} />
                  ))}
                </Pie>
                <Tooltip {...chartTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Todos per User Stacked Bar Chart */}
        <Card className="p-6 mb-5">
          <h2 data-testid="todos-status-by-user-chart" className="text-base font-semibold text-foreground mb-4">Todos Status by User (Top 5)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={todosPerUser}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="name" stroke={CHART_COLORS.axis} fontSize={12} />
              <YAxis stroke={CHART_COLORS.axis} fontSize={12} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Bar dataKey="completed" stackId="a" fill={CHART_COLORS.accent} name="Completed" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" stackId="a" fill={CHART_COLORS.warning} name="Pending" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Posts Distribution Line Chart */}
        <Card className="p-6">
          <h2 data-testid="posts-distribution-chart" className="text-base font-semibold text-foreground mb-4">Posts Distribution by User</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={postsPerUser}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
              <XAxis dataKey="name" stroke={CHART_COLORS.axis} fontSize={12} />
              <YAxis stroke={CHART_COLORS.axis} fontSize={12} />
              <Tooltip {...chartTooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="posts" stroke={CHART_COLORS.info} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </Layout>
  )
}
