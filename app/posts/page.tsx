'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import { postsApi, type Post } from '@/lib/api'

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setLoading(true)
      const data = await postsApi.getAll()
      setPosts(data)
    } catch (error) {
      console.error('Failed to load posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading posts...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-3">{post.body}</p>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-xs text-gray-500">User ID: {post.userId}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedPost && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPost(null)}
          >
            <div
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedPost(null)}
                className="float-right text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {selectedPost.title}
              </h2>
              <p className="text-gray-600 mb-4 whitespace-pre-wrap">
                {selectedPost.body}
              </p>
              <div className="text-sm text-gray-500">
                <p>Post ID: {selectedPost.id}</p>
                <p>User ID: {selectedPost.userId}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

