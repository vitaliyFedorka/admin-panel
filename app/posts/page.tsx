'use client'

import { useState, useEffect } from 'react'
import Layout from '@/components/Layout'
import Card from '@/components/Card'
import { postsApi, type Post } from '@/lib/api'
import { X } from '@phosphor-icons/react'

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
          <div className="text-lg text-muted-foreground">Loading posts...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-6">Posts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((post) => (
            <Card
              key={post.id}
              className="p-6 hover:border-accent/40 hover:-translate-y-0.5 transition-all cursor-pointer"
              onClick={() => setSelectedPost(post)}
            >
              <h2 className="text-base font-semibold text-foreground mb-2 line-clamp-2">
                {post.title}
              </h2>
              <p className="text-muted-foreground text-sm line-clamp-3">{post.body}</p>
              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs text-muted-foreground tabular">User ID: {post.userId}</span>
              </div>
            </Card>
          ))}
        </div>

        {selectedPost && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedPost(null)}
          >
            <Card
              className="p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h2 className="text-xl font-semibold text-foreground">
                  {selectedPost.title}
                </h2>
                <button
                  onClick={() => setSelectedPost(null)}
                  aria-label="Close"
                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-muted-foreground mb-4 whitespace-pre-wrap">
                {selectedPost.body}
              </p>
              <div className="text-sm text-muted-foreground tabular space-y-0.5">
                <p>Post ID: {selectedPost.id}</p>
                <p>User ID: {selectedPost.userId}</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  )
}

