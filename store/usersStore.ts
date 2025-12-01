import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { usersApi, type User } from '@/lib/api'

interface UsersState {
  users: User[]
  isLoading: boolean
  loadUsers: () => Promise<void>
  addUser: (user: User) => void
  updateUser: (id: number, updates: Partial<User>) => void
  deleteUser: (id: number) => void
  resetUsers: () => Promise<void>
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      isLoading: false,
      loadUsers: async () => {
        // Only load from API if we don't have users in store
        if (get().users.length === 0) {
          try {
            set({ isLoading: true })
            const data = await usersApi.getAll()
            set({ users: data, isLoading: false })
          } catch (error) {
            console.error('Failed to load users:', error)
            set({ isLoading: false })
          }
        }
      },
      addUser: (user: User) => {
        set((state) => ({ users: [...state.users, user] }))
      },
      updateUser: (id: number, updates: Partial<User>) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updates } : u)),
        }))
      },
      deleteUser: (id: number) => {
        set((state) => ({ users: state.users.filter((u) => u.id !== id) }))
      },
      resetUsers: async () => {
        try {
          set({ isLoading: true })
          const data = await usersApi.getAll()
          set({ users: data, isLoading: false })
        } catch (error) {
          console.error('Failed to reset users:', error)
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'users-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

