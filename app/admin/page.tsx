'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Post = {
  id: number;
  title: string;
  content: string;
  status: string;
  createdAt: string;
};

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }
    fetchPosts();
  }, [router]);

  async function fetchPosts() {
    const token = localStorage.getItem('token');
    const res = await fetch('/api/posts', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      router.push('/auth');
      return;
    }
    const data = await res.json();
    setPosts(data);
  }

  async function handleSubmit(e: React.FormEvent, status: 'draft' | 'published') {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');

    if (editingPostId) {
      // Edit mode
      await fetch(`/api/posts/${editingPostId}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content, status }),
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setEditingPostId(null);
    } else {
      // Create mode
      await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content, status }),
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    }

    setTitle('');
    setContent('');
    await fetchPosts();
    setLoading(false);
  }

  async function handleDelete(id: number) {
    const token = localStorage.getItem('token');
    await fetch(`/api/posts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchPosts();
  }

  async function handlePublish(id: number) {
    const token = localStorage.getItem('token');
    await fetch(`/api/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'published' }),
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    await fetchPosts();
  }

  function handleEdit(post: Post) {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth');
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full max-w-[800px]">
        <div className="w-full">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Blog</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>

          <div className="border-2 border-gray-300 rounded-lg p-6 shadow-md mb-8">
            <form onSubmit={(e) => handleSubmit(e, 'draft')} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Post Title
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Enter post title"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                  Post Content
                </label>
                <textarea
                  id="content"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter post content"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'draft')}
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {editingPostId ? (loading ? 'Saving...' : 'Save as Draft') : (loading ? 'Creating...' : 'Save as Draft')}
                </button>
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e, 'published')}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {editingPostId ? (loading ? 'Publishing...' : 'Publish') : (loading ? 'Creating...' : 'Publish')}
                </button>
                {editingPostId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPostId(null);
                      setTitle('');
                      setContent('');
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="border-2 border-gray-300 rounded-lg p-6 shadow-md">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-semibold">{post.title}</h2>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    post.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{post.content}</p>
                <div className="flex justify-between items-center">
                  <small className="text-gray-500">
                    Posted on {new Date(post.createdAt).toLocaleString()}
                  </small>
                  <div className="flex gap-2">
                    {post.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(post.id)}
                        className="text-sm text-green-600 hover:text-green-500"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(post)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-sm text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* footer content */}
      </footer>
    </div>
  );
}
