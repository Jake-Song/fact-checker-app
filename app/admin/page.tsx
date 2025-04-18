'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'

type Post = {
  id: number;
  title: string;
  content: string;
  slug: string;
  status: string;
  createdAt: string;
};

function SideMenu() {
  return (
    <div className="w-64 h-screen text-white p-4 mt-8">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Admin Dashboard</h2>
      </div>
      <nav>
        <ul className="space-y-2">
          <li>
            <Link href="/admin" className="flex items-center p-2 hover:bg-gray-700 rounded">
              blog
            </Link>
          </li>
          <li>
            <Link href="/admin/api" className="flex items-center p-2 hover:bg-gray-700 rounded">
              api
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default function AdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingPostSlug, setEditingPostSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const fetchPosts = useCallback(async () => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    const res = await fetch('/api/posts');
    if (res.status === 401) {
      router.push('/auth');
      return;
    }
    const data = await res.json();
    setPosts(data);
  }, [router, status]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }
    fetchPosts();
  }, [router, fetchPosts, status]);

  async function handleSubmit(e: React.FormEvent, status: 'draft' | 'published') {
    e.preventDefault();
    setLoading(true);

    if (editingPostSlug) {
      // Edit mode
      await fetch(`/api/posts/${editingPostSlug}`, {
        method: 'PUT',
        body: JSON.stringify({ title, content, status }),
        headers: { 
          'Content-Type': 'application/json',
        },
      });
      setEditingPostSlug(null);
    } else {
      // Create mode
      await fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ title, content, status }),
        headers: { 
          'Content-Type': 'application/json',
        },
      });
    }

    setTitle('');
    setContent('');
    await fetchPosts();
    setLoading(false);
  }

  async function handleDelete(slug: string) {
    await fetch(`/api/posts/${slug}`, {
      method: 'DELETE',
    });
    await fetchPosts();
  }

  async function handlePublish(slug: string) {
    await fetch(`/api/posts/${slug}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'published' }),
      headers: { 
        'Content-Type': 'application/json',
      },  
    });
    await fetchPosts();
  }

  function handleEdit(post: Post) {
    setEditingPostSlug(post.slug);
    setTitle(post.title);
    setContent(post.content);
  }

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen mt-8">
      <SideMenu />
      <div className="flex-1 p-8">
        <main className="max-w-[800px] mx-auto">
          <div className="w-full">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">Blog Posts</h1>
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
                    Post Content (Supports Markdown)
                  </label>
                  <textarea
                    id="content"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter post content. Use Markdown for formatting:&#10;- [link text](url) for links&#10;- ![alt text](image_url) for images&#10;- **bold text** for emphasis&#10;- *italic text* for italics&#10;- # Heading for headers"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'draft')}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {editingPostSlug ? (loading ? 'Saving...' : 'Save as Draft') : (loading ? 'Creating...' : 'Save as Draft')}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'published')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading}
                  >
                    {editingPostSlug ? (loading ? 'Publishing...' : 'Publish') : (loading ? 'Creating...' : 'Publish')}
                  </button>
                  {editingPostSlug && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPostSlug(null);
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
           
            {/* Preview Section */}
            <div className="border-2 border-gray-300 rounded-lg p-6 shadow-md mb-8">
              <h2 className="text-xl font-semibold mb-4">Preview</h2>
              <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-blue-600">
                <ReactMarkdown
                  components={{
                    // Override default heading components to ensure proper styling
                    h1: ({node, ...props}) => <h1 className="text-4xl font-bold mb-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-3xl font-bold mb-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-2xl font-bold mb-2" {...props} />,
                    h4: ({node, ...props}) => <h4 className="text-xl font-bold mb-2" {...props} />,
                    // Override list components
                    ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-4" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                    // Override paragraph component
                    p: ({node, ...props}) => <p className="mb-4" {...props} />,
                    // Keep the existing code component
                    // @ts-expect-error - ReactMarkdown component types are complex
                    code: ({ node, inline, className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          // @ts-expect-error - SyntaxHighlighter style type is complex
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {content || '*No content to preview*'}
                </ReactMarkdown>
              </div>
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
                          onClick={() => handlePublish(post.slug)}
                          className="text-sm text-green-600 hover:text-green-500"
                        >
                          Publish
                        </button>
                      )}
                      <button
                        onClick={() => {
                          handleEdit(post);
                        }}
                        className="text-sm text-blue-600 hover:text-blue-500"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.slug)}
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
      </div>
    </div>
  );
}
