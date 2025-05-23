'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

type Post = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  authorId: number;
};

export default function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = useCallback(async () => {
    try {
      const { slug } = await params;
      const res = await fetch(`/api/posts/${slug}`);
      if (!res.ok) {
        throw new Error('Post not found');
      }
      const data = await res.json();
      setPost(data);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError(error instanceof Error ? error.message : 'Error loading post');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="text-gray-500">Loading post...</div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
          <div className="text-red-500">{error || 'Post not found'}</div>
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← Back to Blog
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start max-w-[800px] w-full">
        <div className="w-full">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Back to Blog
          </Link>
          <article className="p-6">
            <h1 className="text-3xl font-bold mb-6">{post.title}</h1>
            <div className="prose prose-lg max-w-none dark:prose-invert">
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
                  // @ts-expect-error - ReactMarkdown component types are complex
                  code({ node, inline, className, children, ...props }) {
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
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200">
              <small className="text-gray-500">
                Posted on {new Date(post.createdAt).toLocaleString()}
              </small>
            </div>
          </article>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {/* footer content */}
      </footer>
    </div>
  );
} 