'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: number;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const res = await fetch('/api/posts/public');
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <h1 className="text-2xl font-bold">Blog Posts</h1>
          <div className="text-gray-500">Loading posts...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        {posts.length === 0 ? (
          <div className="text-gray-500">No blog posts yet. Create your first post!</div>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="border-2 border-gray-300 rounded-lg p-6 max-w-[800px] shadow-md relative">
              <div className="mb-4">
                <Link href={`/blog/${post.id}`} className="hover:text-blue-600">
                  <h2 className="font-bold text-xl">{post.title}</h2>
                </Link>
                <p className="mt-4 whitespace-pre-wrap line-clamp-3">{post.content}</p>
              </div>
              <small className="text-gray-500 mt-4 block">
                Posted on {new Date(post.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* footer content */}
      </footer>
    </div>
  )
} 