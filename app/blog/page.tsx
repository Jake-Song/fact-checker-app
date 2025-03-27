'use client';

import { useEffect, useState } from 'react';

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
};

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (editingPostId) {
      // Edit mode
      await fetch(`/api/posts/${editingPostId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content }),
        headers: { 'Content-Type': 'application/json' },
      });
      setEditingPostId(null);
    } else {
      // Create mode
      await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content }),
        headers: { 'Content-Type': 'application/json' },
      });
    }

    setTitle('');
    setContent('');
    await fetchPosts();
    setLoading(false);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
    });
    await fetchPosts();
  }

  function handleEdit(post: Post) {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-[800px]">
            <div className="max-w-2xl mx-auto p-6">
                <h1 className="text-3xl font-bold mb-4">Blog</h1>
                <form onSubmit={handleSubmit} className="space-y-3 mb-6">
                    <input
                    type="text"
                    placeholder="Post title"
                    className="w-full border p-2 rounded"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    />
                    <textarea
                    placeholder="Post content"
                    className="w-full border p-2 rounded"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    />
                    <div className="flex gap-2">
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        disabled={loading}
                    >
                        {editingPostId ? (loading ? 'Saving...' : 'Update Post') : (loading ? 'Creating...' : 'Create Post')}
                    </button>
                    {editingPostId && (
                        <button
                        type="button"
                        onClick={() => {
                            setEditingPostId(null);
                            setTitle('');
                            setContent('');
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                        Cancel
                        </button>
                    )}
                    </div>
                </form>

                <ul className="space-y-4">
                    {posts.map((post) => (
                    <li key={post.id} className="border p-4 rounded">
                        <h2 className="text-xl font-semibold">{post.title}</h2>
                        <p>{post.content}</p>
                        <small className="text-gray-500">
                        Posted on {new Date(post.createdAt).toLocaleString()}
                        </small>
                        <div className="mt-2 flex gap-2">
                        <button
                            onClick={() => handleEdit(post)}
                            className="text-sm text-blue-600 hover:underline"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => handleDelete(post.id)}
                            className="text-sm text-red-600 hover:underline"
                        >
                            Delete
                        </button>
                        </div>
                    </li>
                    ))}
                </ul>
            </div>
        </main>
    </div>
  );
}
