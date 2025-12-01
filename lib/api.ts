import axios from 'axios'

const API_BASE_URL = 'https://jsonplaceholder.typicode.com'

export interface User {
  id: number
  name: string
  username: string
  email: string
  phone?: string
  website?: string
  address?: {
    street: string
    suite: string
    city: string
    zipcode: string
  }
  company?: {
    name: string
    catchPhrase: string
    bs: string
  }
}

export interface Post {
  id: number
  userId: number
  title: string
  body: string
}

export interface Todo {
  id: number
  userId: number
  title: string
  completed: boolean
}

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const response = await axios.get<User[]>(`${API_BASE_URL}/users`)
    return response.data
  },
  getById: async (id: number): Promise<User> => {
    const response = await axios.get<User>(`${API_BASE_URL}/users/${id}`)
    return response.data
  },
  create: async (user: Omit<User, 'id'>): Promise<User> => {
    const response = await axios.post<User>(`${API_BASE_URL}/users`, user)
    return response.data
  },
  update: async (id: number, user: Partial<User>): Promise<User> => {
    const response = await axios.put<User>(`${API_BASE_URL}/users/${id}`, user)
    return response.data
  },
  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/users/${id}`)
  },
}

// Posts API
export const postsApi = {
  getAll: async (): Promise<Post[]> => {
    const response = await axios.get<Post[]>(`${API_BASE_URL}/posts`)
    return response.data
  },
  getById: async (id: number): Promise<Post> => {
    const response = await axios.get<Post>(`${API_BASE_URL}/posts/${id}`)
    return response.data
  },
  getByUserId: async (userId: number): Promise<Post[]> => {
    const response = await axios.get<Post[]>(`${API_BASE_URL}/posts?userId=${userId}`)
    return response.data
  },
}

// Todos API
export const todosApi = {
  getAll: async (): Promise<Todo[]> => {
    const response = await axios.get<Todo[]>(`${API_BASE_URL}/todos`)
    return response.data
  },
  getById: async (id: number): Promise<Todo> => {
    const response = await axios.get<Todo>(`${API_BASE_URL}/todos/${id}`)
    return response.data
  },
  getByUserId: async (userId: number): Promise<Todo[]> => {
    const response = await axios.get<Todo[]>(`${API_BASE_URL}/todos?userId=${userId}`)
    return response.data
  },
}

