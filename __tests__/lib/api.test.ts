import axios from 'axios'
import { usersApi, postsApi, todosApi, type User, type Post, type Todo } from '@/lib/api'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('API functions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('usersApi', () => {
    const mockUser: User = {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      phone: '123-456-7890',
    }

    it('should fetch all users', async () => {
      const mockUsers = [mockUser]
      mockedAxios.get.mockResolvedValue({ data: mockUsers })

      const result = await usersApi.getAll()

      expect(mockedAxios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users')
      expect(result).toEqual(mockUsers)
    })

    it('should fetch user by id', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockUser })

      const result = await usersApi.getById(1)

      expect(mockedAxios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users/1')
      expect(result).toEqual(mockUser)
    })

    it('should create a new user', async () => {
      const newUser = {
        name: 'Jane Doe',
        username: 'janedoe',
        email: 'jane@example.com',
      }
      const createdUser = { ...newUser, id: 2 }
      mockedAxios.post.mockResolvedValue({ data: createdUser })

      const result = await usersApi.create(newUser)

      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users',
        newUser
      )
      expect(result).toEqual(createdUser)
    })

    it('should update a user', async () => {
      const updates = { name: 'John Updated' }
      const updatedUser = { ...mockUser, ...updates }
      mockedAxios.put.mockResolvedValue({ data: updatedUser })

      const result = await usersApi.update(1, updates)

      expect(mockedAxios.put).toHaveBeenCalledWith(
        'https://jsonplaceholder.typicode.com/users/1',
        updates
      )
      expect(result).toEqual(updatedUser)
    })

    it('should delete a user', async () => {
      mockedAxios.delete.mockResolvedValue({ data: {} })

      await usersApi.delete(1)

      expect(mockedAxios.delete).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users/1')
    })
  })

  describe('postsApi', () => {
    const mockPost: Post = {
      id: 1,
      userId: 1,
      title: 'Test Post',
      body: 'This is a test post body',
    }

    it('should fetch all posts', async () => {
      const mockPosts = [mockPost]
      mockedAxios.get.mockResolvedValue({ data: mockPosts })

      const result = await postsApi.getAll()

      expect(mockedAxios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts')
      expect(result).toEqual(mockPosts)
    })

    it('should fetch post by id', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockPost })

      const result = await postsApi.getById(1)

      expect(mockedAxios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts/1')
      expect(result).toEqual(mockPost)
    })

    it('should fetch posts by user id', async () => {
      const mockPosts = [mockPost]
      mockedAxios.get.mockResolvedValue({ data: mockPosts })

      const result = await postsApi.getByUserId(1)

      expect(mockedAxios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/posts?userId=1')
      expect(result).toEqual(mockPosts)
    })
  })

  describe('todosApi', () => {
    const mockTodo: Todo = {
      id: 1,
      userId: 1,
      title: 'Test Todo',
      completed: false,
    }

    it('should fetch all todos', async () => {
      const mockTodos = [mockTodo]
      mockedAxios.get.mockResolvedValue({ data: mockTodos })

      const result = await todosApi.getAll()

      expect(mockedAxios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/todos')
      expect(result).toEqual(mockTodos)
    })

    it('should fetch todo by id', async () => {
      mockedAxios.get.mockResolvedValue({ data: mockTodo })

      const result = await todosApi.getById(1)

      expect(mockedAxios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/todos/1')
      expect(result).toEqual(mockTodo)
    })

    it('should fetch todos by user id', async () => {
      const mockTodos = [mockTodo]
      mockedAxios.get.mockResolvedValue({ data: mockTodos })

      const result = await todosApi.getByUserId(1)

      expect(mockedAxios.get).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/todos?userId=1')
      expect(result).toEqual(mockTodos)
    })
  })
})

